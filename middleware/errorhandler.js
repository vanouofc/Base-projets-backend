
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? "Erreur interne du serveur" : err.message;

  if (statusCode === 500) console.error(err); // on log les vraies erreurs

  res.status(statusCode).json({ message });
};