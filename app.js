import express from "express";
import dotenv from "dotenv";
import { MongoDB_Connection } from "./config/DB.js";
import { errorHandler } from "./middleware/errorhandler.js";
import authRouter from "./routes/auth.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World from Express.js');
});

app.use('/api/auth', authRouter);

app.use(errorHandler);

app.listen(PORT, async () => {
    await MongoDB_Connection();
    console.log(`Serveur demarrer sur http://127.0.0.0.1:${PORT}`);
});