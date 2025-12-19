const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {formidable} = require("formidable");
const { uploadImage, getImage ,uploadFile, getFile} = require("../controllers/uploadController");

// Middleware to parse form-data
const formParser = (req, res, next) => {
    const form = formidable({ multiples: false, keepExtensions: true });
    form.parse(req, (err, fields, files) => {
        if (err) return res.status(400).json({ error: "UPLOAD_PARSE_ERROR" });
        req.fields = fields;
        req.files = files;
        next();
    });
};

router.post("/upload",protect, formParser, uploadImage);
router.post("/uploadfile", protect, formParser, uploadFile);
router.get("/image/:id", getImage);
router.get("/image/:id/:size", getImage);
router.get("/file/:id", getFile);

module.exports = router;
