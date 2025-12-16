const Rooms = require("../models/Rooms");
const store = require("../store");

exports.isTyping = async (req, res) => {
    const { room, isTyping } = req.body;
    if (!room) return res.status(400).send("room id required");

    const roomID = room._id;

    if (!roomID) res.status(400).send("room id required");

    const Room = await Rooms.findById(roomID);

    Room.people.forEach((person) => {
        if (person.toString() !== req.user.id.toString())
            store.io
                .to(person.toString())
                .emit("typing", { id: req.user.id, roomID, isTyping });
    });
    res.status(200).send("ok");
};
