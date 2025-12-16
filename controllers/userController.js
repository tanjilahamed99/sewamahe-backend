const User = require("../models/User");
const WebsiteInfo = require("../models/WebsiteInfo");

exports.getAllUsers = async (req, res) => {
    try {
        let { search, limit } = req.body;
        search = search || "";
        limit = limit || 25;

        const users = await User.aggregate([
            {
                $project: {
                    fullName: { $concat: ["$firstName", " ", "$lastName"] },
                    firstName: 1,
                    lastName: 1,
                    username: 1,
                    email: 1,
                    picture: 1,
                    tagLine: 1,
                    consultantStatus: 1,
                    qualification: 1,
                },
            },
            {
                $match: {
                    $and: [
                        {
                            $or: [
                                { fullName: { $regex: search, $options: "i" } },
                                { email: { $regex: search, $options: "i" } },
                                { username: { $regex: search, $options: "i" } },
                                { firstName: { $regex: search, $options: "i" } },
                                { lastName: { $regex: search, $options: "i" } },
                            ],
                        },
                        { email: { $ne: req.user.email } },
                    ],
                },
            },
            { $sort: { _id: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: "images",
                    localField: "picture",
                    foreignField: "_id",
                    as: "picture",
                },
            },
            { $unwind: { path: "$picture", preserveNullAndEmptyArrays: true } },
        ]);

        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.toggleFavorite = (req, res) => {
    let { roomId } = req.body;
    User.findOne({ _id: req.user._id })
        .then((user) => {
            let update;
            if (user.favorites.includes(roomId))
                update = { $pull: { favorites: roomId } };
            else update = { $push: { favorites: roomId } };
            User.findOneAndUpdate({ _id: req.user._id }, update, { new: true })
                .populate({
                    path: "favorites",
                    populate: [
                        {
                            path: "people",
                            select: "-email -tagLine -password -friends -__v",
                            populate: {
                                path: "picture",
                            },
                        },
                        {
                            path: "lastMessage",
                        },
                        {
                            path: "picture",
                        },
                    ],
                })
                .then((user) => {
                    res.status(200).json({ favorites: user.favorites, roomId });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({ error: true });
                });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: true });
        });
};

exports.getFavorites = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user._id }).populate({
            path: "favorites",
            populate: [
                {
                    path: "people",
                    select: "-email -password -friends -__v",
                    populate: { path: "picture" },
                },
                { path: "lastMessage" },
                { path: "picture" },
            ],
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ favorites: user.favorites });
    } catch (err) {
        console.error("Error fetching favorites:", err);
        res.status(500).json({ error: true, message: err.message });
    }
};

exports.ChangePicture = async (req, res) => {
    try {
        const { imageId } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: { picture: imageId } },
            { new: true }
        ).populate({ path: "picture", strictPopulate: false });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json(user.picture);
    } catch (error) {
        console.error("Error changing picture:", error);
        return res.status(500).json({
            error: "Internal server error",
            message: error.message,
        });
    }
};


exports.getWebData = async (req, res) => {
    try {
    const settings = await WebsiteInfo.findOne(); // Only one document expected
    if (!settings) {
      return res.status(404).json({ message: 'Website settings not found', success: false });
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching website settings', success: false });
  }
};

exports.qualification = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).send({
                message: "Invalid ID provided.",
                success: false,
            });
        }
        const isExistingUser = await User.findById(id);

        if (!isExistingUser) {
            return res.status(404).send({
                message: "User not found.",
                success: false,
            });
        }

        if (isExistingUser.type !== "Consultant") {
            return res.status(401).send({
                success: false,
                message: "Invalid data",
            });
        }

        const { qualification, perMinute } = req.body;

        const updateUserData = await User.findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    price: perMinute,
                    qualification,
                },
            },
            { new: true }
        );
        if (!updateUserData) {
            return res.status(500).send({
                message: "Failed to update user data.",
                success: false,
            });
        }
        res.send({
            message: "Qualification Updated.",
            success: true,
        });
    } catch (error) {
        console.log(error);
        res.send({
            message: "An error occurred while processing your request.",
            success: false,
        });
    }
};