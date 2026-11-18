const express = require('express');
const controller = require('../controllers/transactionController');
const { authenticate, requireRole, STAFF } = require('../middleware/auth');
const { validateBody, validateTransaction } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate, requireRole(...STAFF)); // staff only

router.get('/', controller.getTransactions);
router.get('/:id', controller.getTransaction);
router.post('/', validateBody(validateTransaction), controller.createTransaction);

module.exports = router;
