const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Schema } = mongoose;

const UserSchema = new Schema({
    email: String,
    firstName: String,
    lastName: String,
    username: String,
    fullName: String,
    password: String,
    phone: String,
    type: { type: String, default: "user" },
    level: { type: String, default: "standard" },
    favorites: [{ type: Schema.ObjectId, ref: "rooms" }],
    tagLine: { type: String, default: "New Clover User" },
    picture: { type: Schema.ObjectId, ref: "images" },
    lastOnline: { type: Date , default: Date.now },
    balance: {
        minute: { type: Number, default: 0 },
        amount: { type: Number, default: 0 },
    },
    history: [
        {
            historyType: String,
            amount: Number,
            paymentMethod: String,
            transactionId: String,
            status: { type: String, default: "Pending" },
            account: { type: String, default: "" },
            createdAt: { type: Date, default: Date.now },
            ifsc: { type: String, default: "" },
            holderName: { type: String, default: "" },
            razorpay: { type: Object, default: {} },
            paygic: { type: Object, default: {} },
            author: {
                name: String,
                email: String,
                id: String,
            },
        },
    ],
    price: { type: Number, default: 0 },
    qualification: String,
    consultantStatus: { type: String, default: "Pending" },
    createdAt: { type: Date, default: Date.now },

    // 🔑 Reset password fields
    resetPasswordOTP: String,
    resetPasswordExpires: Date,
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password") || !this.password) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password
UserSchema.methods.comparePassword = function (candidate) {
    return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", UserSchema);
