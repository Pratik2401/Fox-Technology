const express = require('express');
const bookController = require('../controllers/bookController');
const router = express.Router();

router.get('/', bookController.getAll);
router.get('/count', bookController.getCount);
router.get('/:id', bookController.getById);

router.post('/', bookController.create);
router.put('/:id', bookController.update);


module.exports = router;