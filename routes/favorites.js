const express = require('express');
const favoriteController = require('../controllers/favoriteController');
const authRequired = require('../middleware/authRequired');

const router = express.Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/', authRequired, wrap(favoriteController.list));
router.post('/toggle/:productId', authRequired, wrap(favoriteController.toggle));
router.post('/alert-toggle/:favoriteId', authRequired, wrap(favoriteController.toggleAlert));
router.post('/remove/:favoriteId', authRequired, wrap(favoriteController.remove));
router.post('/settings/reminder-toggle', authRequired, wrap(favoriteController.toggleGlobalReminder));

module.exports = router;
