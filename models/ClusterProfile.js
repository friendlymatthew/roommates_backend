const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ClusterProfileSchema = new Schema({
    cluster_name: String,
    cluster_desc: String,
    housing_type: String,
    photo_url: String,
    occupant_ids: Array,
    pointOfContact: String,
    cluster_tags: Array,
    max_occupants: Number,
    is_full: Boolean, 
})

module.exports = mongoose.model("ClusterProfile", ClusterProfileSchema);