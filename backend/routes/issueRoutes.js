const express = require('express');
const issueController = require('../controllers/issueController');
const router = express.Router();

router.get('/', issueController.getAll);

router.get('/count', issueController.getCount);

router.get('/:issue_id', issueController.getById);

router.put('/:issue_id', issueController.update);

router.get('/count/issued', issueController.getIssuedCount);

router.get('/count/returned', issueController.getReturnedCount);

router.get('/count/overdue', issueController.getOverdueCount);

router.get('/count/lost', issueController.getLostCount);

router.get('/count/lost-cleared', issueController.getLostClearedCount);

router.post('/issue', issueController.issueBook);

router.put('/return/:issue_id', issueController.returnBook);

router.put('/lost/:issue_id', issueController.toggleLostStatus);
router.put('/payment/:issue_id', issueController.markPaymentDone);

module.exports = router;