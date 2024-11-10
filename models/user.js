const mongoose = require("mongoose");
const Schema  = mongoose.Schema;

const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
});

userSchema.plugin(passportLocalMongoose); // automatically make hash form for password username etc.

module.exports = mongoose.model("User", userSchema);