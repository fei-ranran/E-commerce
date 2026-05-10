// Codex, GPT-5.5 High, OpenAI.
const express = require('express');
const productController = require('../controllers/productController');
// Codex, GPT-5.5 High, OpenAI.
const authController = require('../controllers/authController');
const authRequired = require('../middleware/authRequired');
// end: Codex, GPT-5.5 High, OpenAI.

const router = express.Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/', wrap(productController.home));
router.get('/second-hand', wrap(productController.secondHand));
router.get('/messages', authRequired, wrap(productController.inbox));
// Codex, GPT-5.5 High, OpenAI.
router.post('/delete-account', authRequired, wrap(authController.deleteAccount));
// end: Codex, GPT-5.5 High, OpenAI.

module.exports = router;
// end: Codex, GPT-5.5 High, OpenAI.
