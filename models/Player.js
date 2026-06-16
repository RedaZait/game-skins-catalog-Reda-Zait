const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema(
  {
    skin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skin',
      required: [true, 'Un objet d’inventaire doit référencer un skin.']
    },
    obtainedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const playerSchema = new mongoose.Schema(
  {
    pseudo: {
      type: String,
      required: [true, 'Le pseudo est obligatoire.'],
      trim: true,
      minlength: [3, 'Le pseudo doit contenir au moins 3 caractères.'],
      unique: true
    },
    solde: {
      type: Number,
      required: [true, 'Le solde initial est obligatoire.'],
      min: [0, 'Le solde ne peut pas être négatif.']
    },
    inventory: {
      type: [inventoryItemSchema],
      default: []
    }
  },
  { timestamps: true }
);

unique: true ;

module.exports = mongoose.model('Player', playerSchema);
