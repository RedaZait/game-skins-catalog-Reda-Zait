function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message
    }));

    return res.status(400).json({
      message: 'Données invalides.',
      errors
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Identifiant MongoDB invalide.',
      errors: [{ field: err.path, message: err.message }]
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      message: 'Valeur déjà utilisée.',
      errors: Object.keys(err.keyPattern || {}).map((field) => ({
        field,
        message: `${field} doit être unique.`
      }))
    });
  }

  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    message: err.message || 'Erreur serveur.'
  });
}

module.exports = errorHandler;
