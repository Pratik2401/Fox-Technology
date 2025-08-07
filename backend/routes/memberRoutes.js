const express = require('express');
const memberController = require('../controllers/memberController');
const router = express.Router();

router.get('/', memberController.getAll);
router.get('/count', memberController.getCount);
router.get('/count/pending-payment', memberController.getPendingPaymentCount);
router.get('/count/cleared-payment', memberController.getClearedPaymentCount);
router.get('/:id', memberController.getById);

router.post('/', memberController.create);


router.put('/:id', memberController.update);
router.put('/:id/fee-status', memberController.toggleFeeStatus);


module.exports = router;