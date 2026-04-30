// Codex, GPT-5.5 High, OpenAI.
const express = require('express');
const cartController = require('../controllers/cartController');

const router = express.Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/', wrap(cartController.show));
router.post('/add/:id', wrap(cartController.add));
router.post('/decrease/:id', cartController.decrease);
router.post('/remove/:id', cartController.remove);
router.post('/clear', cartController.clear);

module.exports = router;
// end: Codex, GPT-5.5 High, OpenAI.
