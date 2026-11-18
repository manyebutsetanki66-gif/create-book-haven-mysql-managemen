const express = require('express');
const controller = require('../controllers/bookController');
const { authenticate, requireRole, STAFF } = require('../middleware/auth');
const { validateBody, validateBook } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate); // every book route needs a logged-in user

router.get('/', controller.getBooks);   // everyone can browse
router.get('/:id', controller.getBook);
router.post('/', requireRole(...STAFF), validateBody(validateBook), controller.createBook);
router.put('/:id', requireRole(...STAFF), validateBody(validateBook, { editing: true }), controller.updateBook);
router.delete('/:id', requireRole(...STAFF), controller.deleteBook);

module.exports = router;
