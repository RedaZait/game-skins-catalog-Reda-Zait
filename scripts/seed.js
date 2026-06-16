require('dotenv').config();

const connectDB = require('../config/db');
const Skin = require('../models/Skin');

const skins = [
  { nom: 'Dragon Rouge', rarete: 'Legendaire', prix: 950 },
  { nom: 'Samouraï Cyber', rarete: 'Epique', prix: 700 },
  { nom: 'Fantôme Bleu', rarete: 'Rare', prix: 420 },
  { nom: 'Soldat Basique', rarete: 'commun', prix: 100 },
  { nom: 'Néon Vortex', rarete: 'Epique', prix: 650 },
  { nom: 'Ombre Royale', rarete: 'Legendaire', prix: 1200 }
];

async function seed() {
  await connectDB();

  const count = await Skin.countDocuments();
  if (count > 0) {
    console.log(`Seed ignoré : ${count} skins existent déjà.`);
    process.exit(0);
  }

  await Skin.insertMany(skins);
  console.log(`${skins.length} skins ajoutés au catalogue.`);
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
