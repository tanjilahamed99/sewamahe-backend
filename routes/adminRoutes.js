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
  allContact,
  deleteContact,
} = require("../controllers/adminController");
const { adminOnly } = require("../middleware/AdminMiddlewere");

const router = express.Router();

router.get("/users/all", adminOnly, getAllUsers);
router.put("/user/update", adminOnly, updateUser);
router.delete("/user", adminOnly, deleteUser);
router.post("/paygic/set", adminOnly, setPaygic);
router.post("/razorpay/set", adminOnly, setRazorpay);
router.put("/website/set", adminOnly, setWebData);
router.get("/paygic/get", adminOnly, getPayGicData);
router.get("/razorpay/get", adminOnly, getRazorpayData);
router.post("/credit", adminOnly, creditUser);
router.post("/consultant-status-update", adminOnly, consultantStatusUpdate);
router.get("/withdrawals/all", adminOnly, allWithdrawalRequest);
router.get("/withdrawals/single/:withdrawalId", adminOnly, getSingleWithdrawal);
router.put(
  "/withdrawal/update/:withdrawalId",
  adminOnly,
  updateWithdrawalStatus
);
router.get("/transactions/all/", adminOnly, allTransaction);

router.get("/contact/get/all", adminOnly, allContact);
router.delete("/contact/delete", adminOnly, deleteContact);

module.exports = router;
