const express = require('express');
const Skin = require('../models/Skin');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const skins = await Skin.find().sort({ prix: 1, nom: 1 });
    res.json(skins);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const skin = await Skin.create(req.body);
    res.status(201).json(skin);
  })
);

module.exports = router;
