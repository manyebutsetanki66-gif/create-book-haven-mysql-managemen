const express = require('express');
const controller = require('../controllers/userController');
const { authenticate, requireRole, STAFF } = require('../middleware/auth');
const { validateBody, validateUser } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);

// Staff can read users (needed for the "borrowed by" list). Only administrators can change them.
router.get('/', requireRole(...STAFF), controller.getUsers);
router.get('/:id', requireRole(...STAFF), controller.getUser);
router.post('/', requireRole('administrator'), validateBody(validateUser, { creating: true }), controller.createUser);
router.put('/:id', requireRole('administrator'), validateBody(validateUser, { creating: false }), controller.updateUser);
router.delete('/:id', requireRole('administrator'), controller.deleteUser);

module.exports = router;
