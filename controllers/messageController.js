const Message = require("../models/Message");
const xss = require("xss");
const Rooms = require("../models/Rooms");
const store = require("../store");
const { Types } = require("mongoose");

// Send message
exports.sendMessage = (req, res, next) => {
  const { roomID, authorID, content, type, fileID } = req.body;

  Message({
    room: roomID,
    author: authorID,
    content: xss(content),
    type,
    file: fileID,
  })
    .save()
    .then((message) => {
      Message.findById(message._id)
        .populate({
          path: 'author',
          select: '-email -password -friends -__v',
          populate: [
            {
              path: 'picture',
            },
          ],
        })
        .populate([{ path: 'file', strictPopulate: false }])
        .then((message) => {
          Rooms.findByIdAndUpdate(roomID, {
            $set: { lastUpdate: message.date, lastMessage: message._id, lastAuthor: authorID },
          })
            .then((room) => {
              room.people.forEach((person) => {
                const personUserID = person.toString();
                store.io.to(personUserID).emit('message-in', { status: 200, message, room });
              });
              res.status(200).json({ message, room });
            })
            .catch((err) => {
              return res.status(500).json({ error: true });
            });
        })
        .catch((err) => {
          return res.status(500).json({ error: true });
        });
    })
    .catch((err) => {
      return res.status(500).json({ error: true });
    });
};

exports.getMoreMessages = async (req, res) => {
    let { roomID, firstMessageID } = req.body;

    try {
        const firstId = new Types.ObjectId(firstMessageID);

        Message.find({
            room: roomID,
            _id: { $lt: firstId },
        })
            .sort({ _id: -1 })
            .limit(20)
            .populate({
                path: "author",
                strictPopulate: false,
                select: "-email -password -friends -__v",
                populate: {
                    path: "picture",
                },
            })
            .lean()
            .then((messages) => {
                messages.reverse();

                res.status(200).json({
                    messages: messages.map((e) => {
                        if (e.author) {
                            return e;
                        } else {
                            return {
                                ...e,
                                author: {
                                    firstName: "Deleted",
                                    lastName: "User",
                                },
                            };
                        }
                    }),
                });
            })
            .catch((err) => {
                console.error("Error loading old messages:", err);
                res.status(500).json({ error: err.message });
            });
    } catch (err) {
        console.error("Invalid ID:", err);
        res.status(400).json({ error: "Invalid message ID" });
    }
};