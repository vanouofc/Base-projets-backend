import {
    signUpService,
    signInService,
    getSessionService,
    verifyEmailService,
    resendEmailOtpService,
    verify2faService,
    requestEnable2faService,
    confirmEnable2faService,
    disable2faService,
    forgotPasswordService,
    resetPasswordService,
    logoutService,
} from "../service/auth.service.js";
import normalizeEmail from "../utils/normalizeemail.js";

export const signUpController = async (req, res, next) => {
    try {
        const {nom, prenom, email, password, phone} = req.body;

        if(!nom || !prenom || !email || !password || !phone) {
            return res.status(400).json({ message: "Tous les champs sont requis." });
        };

        const normalizedEmail = normalizeEmail(email);

        const {user} = await signUpService({nom, prenom, normalizedEmail, password, phone});
        if(!user) {
            return res.status(500).json({ message: "Erreur lors de la création de l'utilisateur." });
        };

        res.status(201).json({
            message: "Utilisateur créé avec succès. Un code de vérification a été envoyé par email.",
            user
        });
    } catch (error) {
        next(error);
    }
};

export const verifyEmailController = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        if(!email || !otp) {
            return res.status(400).json({ message: "Email et code sont requis." });
        };

        const normalizedEmail = normalizeEmail(email);
        const { user, token } = await verifyEmailService(normalizedEmail, otp);

        res.status(200).json({
            message: "Email vérifié avec succès.",
            token,
            user
        });
    } catch (error) {
        next(error);
    }
};

export const resendEmailOtpController = async (req, res, next) => {
    try {
        const { email } = req.body;
        if(!email) {
            return res.status(400).json({ message: "Email requis." });
        };

        const normalizedEmail = normalizeEmail(email);
        await resendEmailOtpService(normalizedEmail);

        res.status(200).json({ message: "Un nouveau code de vérification a été envoyé." });
    } catch (error) {
        next(error);
    }
};

export const signInController = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        if(!email || !password) {
            return res.status(400).json({ message: "Email et mot de passe sont requis." });
        };

        const normalizedEmail = normalizeEmail(email);
        const result = await signInService(normalizedEmail, password);

        if (result.twoFactorRequired) {
            return res.status(200).json({
                message: "Un code de vérification a été envoyé par email.",
                twoFactorRequired: true,
                email: result.email
            });
        };

        res.status(200).json({
            message: "Connexion réussie.",
            token: result.token,
            user: result.user
        });
    } catch (error) {
        next(error);
    };
};

export const verify2faController = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        if(!email || !otp) {
            return res.status(400).json({ message: "Email et code sont requis." });
        };

        const normalizedEmail = normalizeEmail(email);
        const { user, token } = await verify2faService(normalizedEmail, otp);

        res.status(200).json({
            message: "Connexion réussie.",
            token,
            user
        });
    } catch (error) {
        next(error);
    }
};

export const requestEnable2faController = async (req, res, next) => {
    try {
        await requestEnable2faService(req.userId);
        res.status(200).json({ message: "Un code d'activation a été envoyé par email." });
    } catch (error) {
        next(error);
    }
};

export const confirmEnable2faController = async (req, res, next) => {
    try {
        const { otp } = req.body;
        if(!otp) {
            return res.status(400).json({ message: "Code requis." });
        };

        const user = await confirmEnable2faService(req.userId, otp);
        res.status(200).json({ message: "2FA activé avec succès.", user });
    } catch (error) {
        next(error);
    }
};

export const disable2faController = async (req, res, next) => {
    try {
        const { password } = req.body;
        if(!password) {
            return res.status(400).json({ message: "Mot de passe requis." });
        };

        const user = await disable2faService(req.userId, password);
        res.status(200).json({ message: "2FA désactivé avec succès.", user });
    } catch (error) {
        next(error);
    }
};

export const forgotPasswordController = async (req, res, next) => {
    try {
        const { email } = req.body;
        if(!email) {
            return res.status(400).json({ message: "Email requis." });
        };

        const normalizedEmail = normalizeEmail(email);
        await forgotPasswordService(normalizedEmail);

        res.status(200).json({ message: "Si un compte existe avec cet email, un code de réinitialisation a été envoyé." });
    } catch (error) {
        next(error);
    }
};

export const resetPasswordController = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;
        if(!email || !otp || !newPassword) {
            return res.status(400).json({ message: "Email, code et nouveau mot de passe sont requis." });
        };

        const normalizedEmail = normalizeEmail(email);
        await resetPasswordService(normalizedEmail, otp, newPassword);

        res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
    } catch (error) {
        next(error);
    }
};

export async function getSessionController(req, res, next) {
  try {
    const user = await getSessionService(req.userId); // rempli par requireAuth
    res.set("Cache-Control", "no-store");
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

export async function logoutController(req, res, next) {
  try {
    await logoutService(req.userId); // rempli par requireAuth
    res.status(200).json({ message: "Déconnexion réussie." });
  } catch (err) {
    next(err);
  }
};
