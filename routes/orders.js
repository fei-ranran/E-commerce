// Codex, GPT-5.5 High, OpenAI.
const express = require('express');
const orderController = require('../controllers/orderController');
const authRequired = require('../middleware/authRequired'); // Antigravity, Claude Sonnet 4.6 (thinking), Anthropic. 新增：引入鉴权中间件

const router = express.Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/mine', authRequired, wrap(orderController.myOrders)); // Antigravity, Claude Sonnet 4.6 (thinking), Anthropic. 新增：我的订单路由，需登录
router.get('/checkout', wrap(orderController.checkoutForm));
router.post('/', wrap(orderController.create));
router.get('/:id', wrap(orderController.show));

module.exports = router;
//end: Codex, GPT-5.5 High, OpenAI. 