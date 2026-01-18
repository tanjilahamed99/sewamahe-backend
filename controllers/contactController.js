const Contact = require("../models/Contact");

exports.createContact = async (req, res) => {
  try {
    const { name, email, message, subject, phone } = req.body;
    console.log(req.body);
    if (!name || !email || !message || !subject || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const contact = new Contact({ name, email, message, subject, phone });
    await contact.save();
    return res
      .status(201)
      .json({ message: "Contact created successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
