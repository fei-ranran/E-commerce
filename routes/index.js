// Codex, GPT-5.5 High, OpenAI.
const express = require('express');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController'); 

const router = express.Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/', wrap(productController.home));
router.get('/second-hand', wrap(productController.secondHand));
router.post('/delete-account', wrap(authController.deleteAccount));

module.exports = router;
// end: Codex, GPT-5.5 High, OpenAI.