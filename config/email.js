import {Resend} from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const Resend_API_KEY = process.env.RESEND_API_KEY;
if (!Resend_API_KEY) {
  throw new Error("RESEND_API_KEY n'est pas défini.");
};

const FROM = process.env.FROM;
if (!FROM) {
  throw new Error("FROM n'est pas défini.");
};

const resend = new Resend(Resend_API_KEY);

export async function sendEmail(to, subject, html) {
    try {
        await resend.emails.send({
            from: FROM,
            to: to,
            subject: subject,
            html: html
        });
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'e-mail :", error);
    };
};