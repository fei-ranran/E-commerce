const express = require('express');
const adminController = require('../controllers/adminController');
const adminRequired = require('../middleware/adminRequired');

const router = express.Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/similarity-settings', adminRequired, wrap(adminController.similaritySettings));
router.post('/similarity-settings', adminRequired, wrap(adminController.saveSimilaritySettings));

// user management
const superAdminRequired = require('../middleware/superAdminRequired');
router.get('/users', adminRequired, wrap(adminController.usersList));
router.post('/users/:id/delete', adminRequired, wrap(adminController.deleteUser));
router.post('/users/:id/promote', superAdminRequired, wrap(adminController.promoteUser));
router.post('/users/:id/demote', superAdminRequired, wrap(adminController.demoteUser));

module.exports = router;
