
import { verifyToken } from "../utils/TokenPassword.js";
import User from "../model/user.model.js";

export async function requireAuth(req, res, next) {
  // 1. Récupérer le header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Non authentifié" });
  }

  // 2. Extraire le token : "Bearer eyJhb..." → "eyJhb..."
  const token = authHeader.split(" ")[1];

  try {
    // 3. Vérifier et décoder
    const payload = verifyToken(token);

    // 4. Rejeter si le token a été invalidé (logout ou changement de mot de passe
    //    depuis son émission incrémente tokenVersion côté utilisateur).
    const user = await User.findById(payload.publicUser.id).select("tokenVersion");
    if (!user || user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ message: "Session expirée" });
    }

    // 5. Stocker l'id pour la suite
    req.userId = payload.publicUser.id;
    next();
  } catch (err) {
    const message =
      err.name === "TokenExpiredError" ? "Session expirée" : "Token invalide";
    res.status(401).json({ message });
  }
};