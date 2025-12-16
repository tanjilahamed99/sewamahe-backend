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
