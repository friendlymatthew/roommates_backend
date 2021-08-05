const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserInterestSchema = new Schema ({
    user_id: String,

    interest_id: String,
    type_is_cluster: Boolean
})

module.exports = mongoose.model("UserInterest", UserInterestSchema);