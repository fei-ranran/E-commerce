// Codex, GPT-5.5 High, OpenAI.
const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/login', authController.loginForm);
router.post('/login', wrap(authController.login));
router.get('/register', authController.registerForm);
router.post('/register', wrap(authController.register));
router.post('/logout', authController.logout);

module.exports = router;
//end: Codex, GPT-5.5 High, OpenAI.
