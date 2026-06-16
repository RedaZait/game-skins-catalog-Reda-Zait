const express = require('express');
const Player = require('../models/Player');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get(
  '/wealth',
  asyncHandler(async (req, res) => {
    const ranking = await Player.aggregate([
      {
        $unwind: {
          path: '$inventory',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'skins',
          localField: 'inventory.skin',
          foreignField: '_id',
          as: 'skinInfo'
        }
      },
      {
        $unwind: {
          path: '$skinInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$_id',
          pseudo: { $first: '$pseudo' },
          solde: { $first: '$solde' },
          nombreSkins: {
            $sum: {
              $cond: [{ $ifNull: ['$skinInfo._id', false] }, 1, 0]
            }
          },
          valeurInventaire: { $sum: { $ifNull: ['$skinInfo.prix', 0] } }
        }
      },
      {
        $addFields: {
          fortuneTotale: { $add: ['$solde', '$valeurInventaire'] }
        }
      },
      { $sort: { fortuneTotale: -1, pseudo: 1 } }
    ]);

    res.json(ranking);
  })
);

module.exports = router;
