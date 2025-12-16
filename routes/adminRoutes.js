const express = require("express");
const {
  getAllUsers,
  deleteUser,
  updateUser,
  setPaygic,
  setRazorpay,
  setWebData,
  getPayGicData,
  getRazorpayData,
  creditUser,
  consultantStatusUpdate,
  allWithdrawalRequest,
  getSingleWithdrawal,
  updateWithdrawalStatus,
  allTransaction,
} = require("../controllers/adminController");
const { adminOnly } = require("../middleware/AdminMiddlewere");

const router = express.Router();

// router.get("/admin/users/all", adminOnly, getAllUsers);
router.get("/users/all", getAllUsers);
router.put("/user/update", updateUser);
router.delete("/user", deleteUser);
router.post("/paygic/set", setPaygic);
router.post("/razorpay/set", setRazorpay);
router.put("/website/set", setWebData);
router.get("/paygic/get", getPayGicData);
router.get("/razorpay/get", getRazorpayData);
router.post("/credit", creditUser);
router.post("/consultant-status-update", consultantStatusUpdate);
router.get("/withdrawals/all", allWithdrawalRequest);
router.get("/withdrawals/single/:withdrawalId", getSingleWithdrawal);
router.put("/withdrawal/update/:withdrawalId", updateWithdrawalStatus);
router.get("/transactions/all/", allTransaction);

// router.get('/admin/contact/all/:id/:email', adminOnly, require('./getAllContact'));
// router.put('/admin/paygic/set/:id/:email', adminOnly, require('./setPaygic'));
// router.put('/admin/razorpay/set/:id/:email', adminOnly, require('./setRazorpay'));
// router.post('/admin/credit/:id/:email', adminOnly, require('./credit'));
// router.get('/admin/withdrawal/all/:id/:email', adminOnly, require('./all-withdrawal-request'));
// router.get('/admin/withdrawal/single/:id/:email/:withdrawalId', adminOnly, require('./getSingleWithdrawalData'));
// router.post('/admin/withdrawal/update/:id/:email/:withdrawalId', adminOnly, require('./approvedWithdrawal'));
// router.post('/admin/withdrawal/send/:id/:email/:withdrawalId', adminOnly, require('./sendPayment'));

module.exports = router;
