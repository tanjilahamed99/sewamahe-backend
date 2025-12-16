const Message = require("../models/Message");
const Rooms = require("../models/Rooms");
const xss = require("xss");

exports.getRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const room = await Rooms.findOne({ _id: id })
            .populate([{ path: "picture", strictPopulate: false }])
            .populate({
                path: "people",
                select: "-email -tagLine -password -friends -__v",
                populate: [{ path: "picture" }],
            });

        if (!room) {
            return res
                .status(404)
                .json({ error: true, message: "Room not found" });
        }

        // Ensure the current user is part of this room
        const isMember = room.people.some((person) => person._id.toString() === req.user.id.toString()
        );
        if (!isMember) {
            return res
                .status(403)
                .json({ error: true, message: "Access denied" });
        }

        // Find messages
        const messages = await Message.find({ room: room._id })
            .sort({ _id: -1 })
            .limit(50)
            .populate({
                path: "author",
                select: "-email -password -friends -__v",
                populate: [{ path: "picture" }],
            })
            .populate([{ path: "file", strictPopulate: false }])
            .lean();

        messages.reverse();

        const images = await Message.find({ room: room._id, type: "image" })
            .sort({ _id: -1 })
            .limit(50)
            .populate({
                path: "author",
                select: "-email -password -friends -__v",
                populate: [{ path: "picture" }],
            });

        // Replace deleted authors
        const safeMessages = messages.map((m) => {
            if (!m.author) {
                return {
                    ...m,
                    author: { firstName: "Deleted", lastName: "User" },
                };
            }
            return m;
        });

        // ✅ Respond
        return res.status(200).json({
            room: {
                _id: room._id,
                people: room.people,
                title: room.title,
                isGroup: room.isGroup,
                lastUpdate: room.lastUpdate,
                lastAuthor: room.lastAuthor,
                lastMessage: room.lastMessage,
                picture: room.picture,
                messages: safeMessages,
                images,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: "Server error" });
    }
};


exports.getRooms = async (req, res) => {
    try {
        let { limit } = req.body;
        if (!limit) limit = 30;

        const rooms = await Rooms.find({
            people: { $in: [req.user._id] },
            $or: [{ lastMessage: { $ne: null } }, { isGroup: true }],
        })
            .sort({ lastUpdate: -1 })
            .populate([{ path: "picture", strictPopulate: false }])
            .populate({
                path: "people",
                select: "-email -password -friends -__v",
                populate: { path: "picture" },
            })
            .populate("lastMessage")
            .limit(limit);

        return res.status(200).json({ limit, rooms });
    } catch (err) {
        console.error("getRooms error:", err);
        return res.status(500).json({ error: true, message: err.message });
    }
};

exports.addRoom = async (req, res) => {
    try {
        let { id: counterpart } = req.body;
        const findMessagesAndEmit = async (room) => {
            const messages = await Message.find({ room: room._id })
                .sort({ _id: -1 })
                .limit(50)
                .populate({
                    path: "author",
                    select: "-email -password -friends -__v",
                    populate: [{ path: "picture" }],
                })
                .populate([{ path: "file", strictPopulate: false }]);

            const images = await Message.find({ room: room._id, type: "image" })
                .sort({ _id: -1 })
                .limit(50)
                .populate({
                    path: "author",
                    select: "-email -password -friends -__v",
                    populate: [{ path: "picture" }],
                });

            messages.reverse();

            return res.status(200).json({
                room: {
                    _id: room._id,
                    people: room.people,
                    title: xss(room.title),
                    isGroup: room.isGroup,
                    lastUpdate: room.lastUpdate,
                    lastAuthor: room.lastAuthor,
                    lastMessage: room.lastMessage,
                    messages,
                    images,
                },
            });
        };

        let room = await Rooms.findOne({
            people: { $all: [req.user.id, counterpart] },
            isGroup: false,
        }).populate({
            path: "people",
            select: "-email -password -friends -__v",
            populate: [{ path: "picture" }],
        });

        if (room) {
            return await findMessagesAndEmit(room);
        }

        // Create new room if not found
        let newRoom = await Rooms.create({
            people: [req.user.id, counterpart],
            isGroup: false,
        });

        let populatedRoom = await Rooms.findOne({ _id: newRoom._id }).populate(
            "people"
        );

        return await findMessagesAndEmit(populatedRoom);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: err.message });
    }
};

exports.joinRoom = async (req, res) => {
    try {
        const { id } = req.params; // or req.body.id (depending on how you send it)
        const room = await Rooms.findOne({ _id: id })
            .populate([{ path: "picture", strictPopulate: false }])
            .populate({
                path: "people",
                select: "-email -tagLine -password -friends -__v",
                populate: [{ path: "picture" }],
            });

        if (!room) {
            return res
                .status(404)
                .json({ error: true, message: "Room not found" });
        }

        // 🔐 Check if user is in the room
        const isMember = room.people.some(
            (person) => person._id.toString() === req.user.id.toString()
        );
        if (!isMember) {
            return res
                .status(403)
                .json({ error: true, message: "Access denied" });
        }

        // 💬 Find recent messages
        const messages = await Message.find({ room: room._id })
            .sort({ _id: -1 })
            .limit(50)
            .populate({
                path: "author",
                select: "-email -password -friends -__v",
                populate: [{ path: "picture" }],
            })
            .populate([{ path: "file", strictPopulate: false }])
            .lean();

        // 🖼️ Find recent images
        const images = await Message.find({ room: room._id, type: "image" })
            .sort({ _id: -1 })
            .limit(50)
            .populate({
                path: "author",
                select: "-email -password -friends -__v",
                populate: [{ path: "picture" }],
            })
            .lean();

        // 👻 Replace deleted authors
        const safeMessages = messages
            .reverse()
            .map((msg) =>
                msg.author
                    ? msg
                    : {
                          ...msg,
                          author: { firstName: "Deleted", lastName: "User" },
                      }
            );

        // ✅ Response
        return res.status(200).json({
            room: {
                _id: room._id,
                title: room.title,
                isGroup: room.isGroup,
                lastUpdate: room.lastUpdate,
                lastAuthor: room.lastAuthor,
                lastMessage: room.lastMessage,
                picture: room.picture,
                people: room.people,
                messages: safeMessages,
                images,
            },
        });
    } catch (err) {
        console.error("joinRoom error:", err);
        return res.status(500).json({
            error: true,
            message: "Server error",
        });
    }
};


exports.deleteRoom = async (req, res) => {
    let { roomId:id } = req.body;
    try {
        await Rooms.findOneAndDelete({ _id: id });
    } catch (e) {
        return res
            .status(404)
            .json({ status: "error", message: "room not found" });
    }

    try {
        await Message.deleteMany({ room: id });
    } catch (e) {
        return res.status(404).json({
            status: "error",
            message: "error while deleting messages",
        });
    }

    res.status(200).json({ status: "success", message: "room deleted" });
};

