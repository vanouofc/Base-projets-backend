import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const {JWT_SECRET, JWT_EXPIRES_IN} = process.env;
if(!JWT_SECRET || !JWT_EXPIRES_IN) {
    throw new Error("JWT_SECRET et JWT_EXPIRES_IN non définis.");
};

export async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
};

export async function comparePassword(password, hashedPassword) {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
};

export function generateToken(payload) {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return token;
};

export function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
};