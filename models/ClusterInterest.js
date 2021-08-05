const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ClusterInterestSchema = new Schema({
    cluster_id: String,
    type_is_cluster: Boolean,
    interest_user_id: String
})

module.exports = mongoose.model("ClusterInterest", ClusterInterestSchema);