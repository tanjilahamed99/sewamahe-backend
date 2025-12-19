const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { razorpay , createPaymentIntent, razorpayPaymentValidate, topUp, paygic, withdrawRequest} = require("../controllers/paymentController");

const router = express.Router();
// razorpay
router.get("/razorpay/get/:id/:email", protect, razorpay);
router.post("/create-payment-intent",protect, createPaymentIntent);
router.post("/validate-payment", protect, razorpayPaymentValidate);
router.post("/balance/top-up/:id", protect, topUp);

// paygic
router.post("/top-up/paygic", protect, paygic);

// Balance Withdraw Request
router.post("/balance/withdrawal-request/:id", protect, withdrawRequest);

module.exports = router;