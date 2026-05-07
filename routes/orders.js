// Codex, GPT-5.5 High, OpenAI.
const express = require('express');
const orderController = require('../controllers/orderController');
const authRequired = require('../middleware/authRequired'); // Antigravity, Claude Sonnet 4.6 (thinking), Anthropic. 新增：引入鉴权中间件

const router = express.Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/mine', authRequired, wrap(orderController.myOrders)); // Antigravity, Claude Sonnet 4.6 (thinking), Anthropic. 新增：我的订单路由，需登录
// Codex, GPT-5.5 High, OpenAI.
router.get('/checkout', authRequired, wrap(orderController.checkoutForm));
router.post('/', authRequired, wrap(orderController.create));
// end: Codex, GPT-5.5 High, OpenAI.
router.post('/:id/confirm-received', authRequired, wrap(orderController.confirmReceived));
router.post('/:id/reviews', authRequired, wrap(orderController.submitReview));
// Codex, GPT-5.5 High, OpenAI.
router.get('/:id', authRequired, wrap(orderController.show));
// end: Codex, GPT-5.5 High, OpenAI.

module.exports = router;
// end: Codex, GPT-5.5 High, OpenAI.
