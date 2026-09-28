import crypto from "crypto";
import { hashPassword, comparePassword } from "./TokenPassword.js";

const OTP_Expire = 10;

export function generateOtp() {
    return crypto.randomInt(100000, 1000000).toString();
};

export async function hashOtp(otp) {
    return hashPassword(otp);
};

export async function compareOtp(otp, hashedOtp) {
    return comparePassword(otp, hashedOtp);
};

export function getOtpExpiry() {
    return new Date(Date.now() + OTP_Expire * 60 * 1000);
};

export function isOtpExpired(expiresAt) {
    if (!expiresAt) return true;
    return Date.now() > new Date(expiresAt).getTime();
};
