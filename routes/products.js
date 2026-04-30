// Codex, GPT-5.5 High, OpenAI.
const express = require('express');
const productController = require('../controllers/productController');
const authRequired = require('../middleware/authRequired');

const router = express.Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/new', authRequired, productController.newForm);
router.get('/mine', authRequired, wrap(productController.mine));
router.post('/', authRequired, wrap(productController.create));
router.get('/:id', wrap(productController.detail));
router.get('/:id/edit', authRequired, wrap(productController.editForm));
router.put('/:id', authRequired, wrap(productController.update));
router.delete('/:id', authRequired, wrap(productController.remove));

module.exports = router;
//end: Codex, GPT-5.5 High, OpenAI. 