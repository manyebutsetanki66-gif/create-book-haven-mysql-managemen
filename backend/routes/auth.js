const express = require('express');
const controller = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/login', controller.login); // public
router.get('/me', authenticate, controller.me);

module.exports = router;
