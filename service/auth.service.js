import mongoose from 'mongoose';
import User from '../model/user.model.js';
import dotenv from 'dotenv';
import { hashPassword, comparePassword, generateToken } from "../utils/TokenPassword.js";
import { generateOtp, hashOtp, compareOtp, getOtpExpiry, isOtpExpired } from "../utils/otp.js";
import { renderUser } from "../utils/renderuser.js";
import { sendEmail } from "../config/email.js";

dotenv.config();

export async function signUpService (userData) {
    const { nom, prenom, normalizedEmail, password, phone } = userData;

    const existUser = await User.findOne({ $or: [{ email: normalizedEmail }, { phone }] });
    if (existUser) {
        throw new Error('L\'utilisateur existe déjà avec cet email ou ce numéro de téléphone.');
    };

    const hashedPassword = await hashPassword(password);

    const otp = generateOtp();
    const hashedOtp = await hashOtp(otp);

    const newUser = new User({
        nom,
        prenom,
        email: normalizedEmail,
        password: hashedPassword,
        phone,
        emailotp: hashedOtp,
        emailOtpExpires: getOtpExpiry(),
    });
    await newUser.save();

    await sendEmail(newUser.email, "Vérifiez votre adresse email", `<p>Bonjour ${newUser.prenom},</p><p>Votre code de vérification est : <strong>${otp}</strong></p><p>Ce code expire dans 10 minutes.</p>`);

    const publicUser = await renderUser(newUser);
    return { user: publicUser };
};

export async function verifyEmailService (email, otp) {
    const user = await User.findOne({ email });
    if (!user) {
        const error = new Error("Utilisateur introuvable.");
        error.statusCode = 404;
        throw error;
    };

    if (user.emailVerified) {
        const error = new Error("Cet email est déjà vérifié.");
        error.statusCode = 400;
        throw error;
    };

    if (!user.emailotp || isOtpExpired(user.emailOtpExpires) || !(await compareOtp(otp, user.emailotp))) {
        const error = new Error("Code invalide ou expiré.");
        error.statusCode = 400;
        throw error;
    };

    user.emailVerified = true;
    user.emailotp = null;
    user.emailOtpExpires = null;
    await user.save();

    await sendEmail(user.email, "Bienvenue sur notre application", `<p>Bonjour ${user.prenom},</p><p>Votre email a été vérifié avec succès. Nous sommes ravis de vous compter dans notre communauté.</p>`);

    const publicUser = await renderUser(user);
    const token = await generateToken({ publicUser, tokenVersion: user.tokenVersion });

    return { user: publicUser, token };
};

export async function resendEmailOtpService (email) {
    const user = await User.findOne({ email });
    if (!user) {
        const error = new Error("Utilisateur introuvable.");
        error.statusCode = 404;
        throw error;
    };

    if (user.emailVerified) {
        const error = new Error("Cet email est déjà vérifié.");
        error.statusCode = 400;
        throw error;
    };

    const otp = generateOtp();
    user.emailotp = await hashOtp(otp);
    user.emailOtpExpires = getOtpExpiry();
    await user.save();

    await sendEmail(user.email, "Vérifiez votre adresse email", `<p>Votre nouveau code de vérification est : <strong>${otp}</strong></p><p>Ce code expire dans 10 minutes.</p>`);
};

export async function signInService (email, password) {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Utilisateur non trouvé.');
    };

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
        throw new Error('Mot de passe incorrect.');
    };

    if (!user.emailVerified) {
        const error = new Error("Veuillez vérifier votre adresse email avant de vous connecter.");
        error.statusCode = 403;
        throw error;
    };

    if (user.a2fEnabled) {
        const otp = generateOtp();
        user.a2fotp = await hashOtp(otp);
        user.a2fOtpExpires = getOtpExpiry();
        await user.save();

        await sendEmail(user.email, "Votre code de connexion", `<p>Votre code de vérification est : <strong>${otp}</strong></p><p>Ce code expire dans 10 minutes.</p>`);

        return { twoFactorRequired: true, email: user.email };
    };

    const publicUser = await renderUser(user);
    const token = await generateToken({ publicUser, tokenVersion: user.tokenVersion });

    return { user: publicUser, token };
};

export async function verify2faService (email, otp) {
    const user = await User.findOne({ email });
    if (!user) {
        const error = new Error("Utilisateur introuvable.");
        error.statusCode = 404;
        throw error;
    };

    if (!user.a2fEnabled) {
        const error = new Error("Le 2FA n'est pas activé pour ce compte.");
        error.statusCode = 400;
        throw error;
    };

    if (!user.a2fotp || isOtpExpired(user.a2fOtpExpires) || !(await compareOtp(otp, user.a2fotp))) {
        const error = new Error("Code invalide ou expiré.");
        error.statusCode = 400;
        throw error;
    };

    user.a2fotp = null;
    user.a2fOtpExpires = null;
    await user.save();

    const publicUser = await renderUser(user);
    const token = await generateToken({ publicUser, tokenVersion: user.tokenVersion });

    return { user: publicUser, token };
};

export async function requestEnable2faService (userId) {
    const user = await User.findById(userId);
    if (!user) {
        const error = new Error("Utilisateur introuvable.");
        error.statusCode = 404;
        throw error;
    };

    if (user.a2fEnabled) {
        const error = new Error("Le 2FA est déjà activé.");
        error.statusCode = 400;
        throw error;
    };

    const otp = generateOtp();
    user.a2fotp = await hashOtp(otp);
    user.a2fOtpExpires = getOtpExpiry();
    await user.save();

    await sendEmail(user.email, "Activation du 2FA", `<p>Votre code d'activation du 2FA est : <strong>${otp}</strong></p><p>Ce code expire dans 10 minutes.</p>`);
};

export async function confirmEnable2faService (userId, otp) {
    const user = await User.findById(userId);
    if (!user) {
        const error = new Error("Utilisateur introuvable.");
        error.statusCode = 404;
        throw error;
    };

    if (!user.a2fotp || isOtpExpired(user.a2fOtpExpires) || !(await compareOtp(otp, user.a2fotp))) {
        const error = new Error("Code invalide ou expiré.");
        error.statusCode = 400;
        throw error;
    };

    user.a2fEnabled = true;
    user.a2fotp = null;
    user.a2fOtpExpires = null;
    await user.save();

    return renderUser(user);
};

export async function disable2faService (userId, password) {
    const user = await User.findById(userId);
    if (!user) {
        const error = new Error("Utilisateur introuvable.");
        error.statusCode = 404;
        throw error;
    };

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
        const error = new Error("Mot de passe incorrect.");
        error.statusCode = 401;
        throw error;
    };

    user.a2fEnabled = false;
    user.a2fotp = null;
    user.a2fOtpExpires = null;
    await user.save();

    return renderUser(user);
};

export async function forgotPasswordService (email) {
    const user = await User.findOne({ email });
    if (!user) {
        // On ne révèle jamais si l'email existe ou non : on sort silencieusement.
        return;
    };

    const otp = generateOtp();
    user.resetPasswordOtp = await hashOtp(otp);
    user.resetPasswordOtpExpires = getOtpExpiry();
    await user.save();

    await sendEmail(user.email, "Réinitialisation de mot de passe", `<p>Votre code de réinitialisation est : <strong>${otp}</strong></p><p>Ce code expire dans 10 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>`);
};

export async function resetPasswordService (email, otp, newPassword) {
    const user = await User.findOne({ email });
    if (!user || !user.resetPasswordOtp || isOtpExpired(user.resetPasswordOtpExpires) || !(await compareOtp(otp, user.resetPasswordOtp))) {
        // Même message que l'utilisateur existe ou non, pour éviter l'énumération de comptes.
        const error = new Error("Code invalide ou expiré.");
        error.statusCode = 400;
        throw error;
    };

    user.password = await hashPassword(newPassword);
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpires = null;
    user.tokenVersion += 1; // invalide toutes les sessions ouvertes avec l'ancien mot de passe
    await user.save();

    await sendEmail(user.email, "Mot de passe modifié", `<p>Bonjour ${user.prenom},</p><p>Votre mot de passe vient d'être modifié. Si vous n'êtes pas à l'origine de cette action, contactez le support immédiatement.</p>`);
};

export async function logoutService (userId) {
    await User.updateOne({ _id: userId }, { $inc: { tokenVersion: 1 } });
};

export async function getSessionService(userId) {

  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("Utilisateur introuvable");
    error.statusCode = 401;
    throw error;
  };

  const normalizedUser = await renderUser(user);

  return normalizedUser;
};
