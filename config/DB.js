import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const DB_URL = process.env.MONGODB_URL;

export async function MongoDB_Connection() {
    try {
        console.log("Tentative de connexion à MongoDB...");
        await mongoose.connect(DB_URL);
        console.log("Connexion reussie à MongoDB.");
    } catch(error) {
        console.log("Erreur lors de la connexion à MongoDB : ", error);
    };
};

export async function Postgres_Connection(params) {
    
};