const mongoose = require('mongoose');

async function connectDB() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI manquant. Vérifie ton fichier .env à la racine du projet.');
  }

  await mongoose.connect(process.env.MONGO_URI, {
    dbName: process.env.MONGO_DB_NAME || 'game_skins_catalog',
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000
  });

  console.log(`MongoDB connecté : ${mongoose.connection.name}`);
}

module.exports = connectDB;
