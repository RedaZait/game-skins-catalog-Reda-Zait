const express = require('express');
const Player = require('../models/Player');
const Skin = require('../models/Skin');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const players = await Player.find()
      .populate('inventory.skin')
      .sort({ createdAt: -1 });

    res.json(players);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const player = await Player.create({
      pseudo: req.body.pseudo,
      solde: req.body.solde,
      inventory: []
    });

    res.status(201).json(player);
  })
);

router.post(
  '/:id/buy',
  asyncHandler(async (req, res) => {
    const { skinId } = req.body;

    if (!skinId) {
      const error = new Error('skinId est obligatoire dans le corps de la requête.');
      error.statusCode = 400;
      throw error;
    }

    const [player, skin] = await Promise.all([
      Player.findById(req.params.id),
      Skin.findById(skinId)
    ]);

    if (!player) {
      const error = new Error('Joueur introuvable.');
      error.statusCode = 404;
      throw error;
    }

    if (!skin) {
      const error = new Error('Skin introuvable.');
      error.statusCode = 404;
      throw error;
    }

    if (player.solde < skin.prix) {
      const error = new Error('Solde insuffisant pour acheter ce skin.');
      error.statusCode = 400;
      throw error;
    }

    player.solde -= skin.prix;
    player.inventory.push({ skin: skin._id, obtainedAt: new Date() });
    await player.save();

    const updatedPlayer = await Player.findById(player._id).populate('inventory.skin');

    res.json({
      message: `${player.pseudo} a acheté ${skin.nom}.`,
      player: updatedPlayer
    });
  })
);

module.exports = router;
