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


module.exports = router;
