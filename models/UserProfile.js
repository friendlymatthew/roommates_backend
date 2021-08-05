const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserProfileSchema = new Schema({
    email: String,
    user_desc: String,
    name: String,
    social_media: String,
    pronouns: String,
    photo_url: String,
    user_tags: Array,
    in_cluster: Boolean,
})

module.exports = mongoose.model("UserProfile", UserProfileSchema)