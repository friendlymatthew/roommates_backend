const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TagSchema = new Schema({
    is_user_tag: Boolean,
    category: String,
    tag_content: String,
    tag_users: Array
})

module.exports = mongoose.model("Tag", TagSchema);