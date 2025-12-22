const express = require("express");
const {
  getAllUsers,
  toggleFavorite,
  getFavorites,
  ChangePicture,
  qualification,
  getWebData,
  updateCallBalance,
  withdrawalRequest,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, getAllUsers);
router.post("/favorites", protect, getFavorites);
router.post("/toggleFavorite", protect, toggleFavorite);
router.post("/changePicture", protect, ChangePicture);
router.post("/qualification/set-price/:id", protect, qualification);
router.get("/webData/get", getWebData);
router.put("/balance/update", protect, updateCallBalance);
router.put("/balance/withdrawal-request/:id",withdrawalRequest);

module.exports = router;
