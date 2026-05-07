const express = require('express');
const adminController = require('../controllers/adminController');
const adminRequired = require('../middleware/adminRequired');

const router = express.Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/similarity-settings', adminRequired, wrap(adminController.similaritySettings));
router.post('/similarity-settings', adminRequired, wrap(adminController.saveSimilaritySettings));

module.exports = router;
