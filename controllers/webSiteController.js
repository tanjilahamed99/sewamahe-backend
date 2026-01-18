const LiveKit = require("../models/LiveKit");
const WebsiteInfo = require("../models/WebsiteInfo");

exports.getWebSiteInfo = async (req, res) => {
  try {
    const settings = await WebsiteInfo.findOne();
    if (!settings) {
      return res.status(404).json({
        message: "Website settings not found",
        success: false,
      });
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching website settings",
      success: false,
    });
  }
};

exports.getLiveKitUserData = async (req, res) => {
  try {
    const settings = await LiveKit.findOne(); // Only one document expected
    if (!settings) {
      return res
        .status(404)
        .json({ message: "Website settings not found", success: false });
    }

    return res.json({ success: true, data: { url: settings.url } });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching website settings", success: false });
  }
};
