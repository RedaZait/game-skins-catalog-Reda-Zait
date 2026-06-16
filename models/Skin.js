const mongoose = require('mongoose');

const skinSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom du skin est obligatoire.'],
      trim: true
    },
    rarete: {
      type: String,
      required: [true, 'La rareté est obligatoire.'],
      enum: {
        values: ['commun', 'Rare', 'Epique', 'Legendaire'],
        message: 'La rareté doit être : commun, Rare, Epique ou Legendaire.'
      }
    },
    prix: {
      type: Number,
      required: [true, 'Le prix est obligatoire.'],
      min: [0, 'Le prix ne peut pas être négatif.']
    }
  },
  { timestamps: true }
);

skinSchema.index({ rarete: 1 });
skinSchema.index({ prix: 1 });

module.exports = mongoose.model('Skin', skinSchema);
