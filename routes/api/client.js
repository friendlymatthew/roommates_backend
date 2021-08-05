const express = require("express");
const async = require("async");
const router = express.Router();
const UserInterest = require("../../models/UserInterest");
const UserProfile = require("../../models/UserProfile");
const Tag = require("../../models/Tag");
const { check, validationResult } = require("express-validator");
var ObjectId = require("mongodb").ObjectId;
const ClusterProfile = require("../../models/ClusterProfile");
const ClusterInterest = require("../../models/ClusterInterest");

/*
Creating User Profile
*/
router.post("/user/create_profile", [
    check("email").notEmpty().isString().isEmail(),
    check("user_desc").isString(),
    check("name").notEmpty().isString(),
    check("social_media").notEmpty().isString(),
    check("pronouns").notEmpty().isString(),
    check("photo_url").notEmpty().isString(),
    check("user_tags").isArray(),
    check("in_cluster").notEmpty().isBoolean()
], async(req, res) => {
    const schemaValidationErrors = validationResult(req);
    console.log(":::SchemaValidation", schemaValidationErrors);

    if(!schemaValidationErrors.isEmpty()) {
        return res.status(404).send({
            message: "The inputs you entered to register are invalid."
        })
    }

    UserProfile.findOne({email: req.body.email}).then(user => {
        if(user) {
            return res.status(404).send({
                message: "The User already exists or invalid request body."
            })
        } else {
            const newUser = new UserProfile(req.body);
            console.log("new profile", newUser);
            newUser.save().catch(err => console.log(err));
            return res.status(201).send(newUser);
        }
    });
});


router.put("/user/update_profile/:email", [
    check("email").notEmpty().isString().isEmail(),
    check("user_desc").isString(),
    check("name").notEmpty().isString(),
    check("social_media").notEmpty().isString(),
    check("pronouns").notEmpty().isString(),
    check("photo_url").notEmpty().isString(),
    check("user_tags").isArray(),
    check("in_cluster").notEmpty().isBoolean()
], async(req, res) => {
    const schemaValidationErrors = validationResult(req);

    if(!schemaValidationErrors.isEmpty()) {
        console.log(schemaValidationErrors);
        return res.status(404).send({
            message: "The inputs you entered to update this user profile are invalid."
        })
    }

    var query = { email: req.body.email };

    UserProfile.findOneAndUpdate(query, {
        email: req.body.email,
        user_desc: req.body.user_desc,
        name: req.body.name,
        social_media: req.body.social_media,
        pronouns: req.body.pronouns,
        photo_url: req.body.photo_url,
        user_tags: req.body.user_tags,
        in_cluster: req.body.in_cluster
    }).then(user => {
        if(!user) {
            res.status(400).send({
                message: "User can not be found!"
            });
        } else {
            res.status(200).send(user);
        }
    })
    .catch(err => res.status(404).json(err)); 
});


router.get("/user/all_users", async(req, res) => {
    UserProfile.find().then(users => {
        return res.status(200).send(restaurants);
    });
});

router.get("/user/single_user/:user_email", (req, res) => {
    UserProfile.findOne({ email: req.params.user_email }).then(user => {
        if(!user) {
            return res.status(404).send({
                message: "The User does not exist."
            })
        } else {
            return res.status(200).send(user);
        }
    });
});

router.post("/user/add_interest/:user_id", [
    check("user_id").notEmpty().isString(),
    check("type_is_cluster").isBoolean(),
    check("interest_user_id").notEmpty().isString()
], async(req, res) => {
    const schemaValidationErrors = validationResult(req);

    console.log("THIS IS THE SCHEMAVERRO", schemaValidationErrors.isEmpty())
    if(!schemaValidationErrors.isEmpty()) {
        return res.status(404).send({
            message: "Cannot add interest. Inputs are invalid."
        })
    }

    const id = req.params.user_id;

    UserProfile.findById(id).then(user => {
        if(!user) {
            res.status(400).send({
                message: "You sent an invalid string. This string cannot be converted back to an object ID."
            });
        }
    }) 
    async.waterfall([
        function(done) {
            UserProfile.findById(ObjectId(id), function (err, user) {
                if(user) {
                    done(null, user);
                } else {
                    return res.status(404).send({
                        message: "The User does not exist. You cannot add a interest."
                    })
                }
            });
        }, 
        function(user, done) {
            UserInterest.find({user_id: id}, function (err, interests) {
                const newInterest = new UserInterest(req.body);
                newInterest.save().catch(err => console.log(err));
                return res.status(201).send(newInterest);
            });
        }
    ], function(err) {
        if(err) {
            throw new Error(err);
        } else {
            console.log("No error occured. Operation finished.");
        }
    })
});

router.get("/user/all_interests/type_user/:user_id", async(req, res) => {
    const id = req.params.user_id;

    if(!ObjectId.isValid(id)) {
        res.status(400).send({
            message: "You sent an invalid string. This string cannot be converted back to an object ID."
        });
        return;
    }
    UserInterest.find({user_id: id, is_cluster: false}).then(interests => {
        return res.status(200).send(interests);
    })

});

router.get("/user/all_interests/type_cluster/:user_id", async(req, res) => {
    const id = req.params.user_id;

    if(!ObjectId.isValid(id)) {
        res.status(400).send({
            message: "You sent an invalid string. This string cannot be converted back to an object ID."
        });
        return;
    }
    UserInterest.find({user_id: id, is_cluster: true}).then(interests => {
        return res.status(200).send(interests);
    })
});


router.get("/user/all_tags/:user_id", async(req, res) => {
    const id = req.params.user_id;
    if(!ObjectId.isValid(id)) {
        res.status(400).send({
            message: "You sent an invalid string. This string cannot be converted back to an object ID."
        });
        return;
    }
    Tag.find({tag_users: id, is_user_tag: true}).then(tags => {
        return res.status(200).send(tags);
    })
});

router.get("/tag/all_user_tags", async(req, res) => {
    Tag.find({is_user_tag: true}).then(user_tags => {
        return res.status(200).send(user_tags);
    })
})

router.get("/tag/all_cluster_tags", async(req, res) => {
    Tag.find({is_user_tag: false}).then(user_tags => {
        return res.status(200).send(user_tags);
    })
})


router.delete("/user/delete_interest/:id", async(req, res) => {
    const id = req.params._id;

    if(!ObjectId.isValid(id)) {
        res.status(400).send({
            message: "You sent an invalid string. This string cannot be converted back to an object ID."
        });
        return;
    }
    UserInterest.findById(id).then(interest => {
        interest.remove().then(() => res.status(200).send({
            message: "Deleted the interest."
        }));
    }).catch(err => res.status(404).send({
        message: "No interest found to delete."
    }));

});


router.post("/cluster/create_cluster", [
    check("cluster_name").notEmpty().isString(),
    check("cluster_desc").isString(),
    check("housing_type").notEmpty().isString(),
    check("photo_url").notEmpty().isString(),
    check("occupant_ids").notEmpty().isArray(),
    check("pointOfContact").notEmpty().isString(),
    check("cluster_tags").notEmpty().isArray(),
    check("max_occupants").notEmpty().isNumeric(),
    check("is_full").notEmpty().isBoolean()
], async(req, res) => {
    const schemaValidationErrors = validationResult(req);
    if(!schemaValidationErrors.isEmpty()) {
        return res.status(404).send({
            message: "The inputs you entered to register are invalid."
        })
    }

    ClusterProfile.findOne({cluster_name: req.body.cluster_name}).then(cluster => {
        if(cluster) {
            return res.status(404).send({
                message: "Cluster name already exists or invalid request body."
            })
        } else {
            const newCluster = new ClusterProfile(req.body);
            newCluster.save().catch(err => console.log(err));
            return res.status(201).send(newCluster);
        }
    });
});

router.post("/user/add_interest/:cluster_id", [
    check("cluster_name").notEmpty().isString(),
    check("cluster_desc").isString(),
    check("housing_type").notEmpty().isString(),
    check("photo_url").notEmpty().isString(),
    check("occupant_ids").notEmpty().isArray(),
    check("pointOfContact").notEmpty().isString(),
    check("cluster_tags").notEmpty().isArray(),
    check("max_occupants").notEmpty().isNumeric(),
    check("is_full").notEmpty().isBoolean()
], async(req, res) => {
    const schemaValidationErrors = validationResult(req);

    if(!schemaValidationErrors.isEmpty()) {
        returnres.status(404).send({
            message: "Cannot add interest. Inputs are invalid."
        })
    }

    const id = req.params.cluster_id;

    ClusterProfile.findById(id).then(cluster => {
        if(!cluster) {
            res.status(400).send({
                message: "You sent an invalid string. This string cannot be converted back to an object ID."
            });
        }
    })
    async.waterfall([
        function(done) {
            ClusterProfile.findById(ObjectId(id), function(err, user) {
                if(user) {
                    done(null, user);
                } else {
                    return res.status(404).send({
                        message: "The User does not exist. You cannot add a interest."
                    })
                }
            });
        },
        function(user, done) {
            ClusterInterest.find({cluster_id: id}, function(err, interests) {
                const newInterest = new ClusterInterest(req.body);
                newInterest.save().catch(err => console.log(err));
                return res.status(201).send(newInterest);
            });
        }
    ], function(err) {
        if(err) {
            throw new Error(err);
        } else {
            console.log("No error occured. Operation finished.");
        }
    })
});

router.put("/cluster/update_cluster/:cluster_id", [
    check("cluster_name").notEmpty().isString(),
    check("cluster_desc").isString(),
    check("housing_type").notEmpty().isString(),
    check("photo_url").notEmpty().isString(),
    check("occupant_ids").notEmpty().isArray(),
    check("pointOfContact").notEmpty().isString(),
    check("cluster_tags").notEmpty().isArray(),
    check("max_occupants").notEmpty().isNumeric(),
    check("is_full").notEmpty().isBoolean()
], async(req, res) => {
    const schemaValidationErrors = validationResult(req);

    if(!schemaValidationErrors.isEmpty()) {
        return res.status(404).send({
            message: "The inputs you entered to update this user profile are invalid."
        })
    }

    var query = { id: req.body.cluster_id };

    ClusterProfile.findOneAndUpdate(query, {
        cluster_name: req.body.cluster_name,
        cluster_desc: req.body.cluster_desc,
        housing_type: req.body.housing_type,
        photo_url: req.body.photo_url,
        occupant_ids: req.body.occupant_ids,
        pointOfContact: req.body.pointOfContact,
        cluster_tags: req.body.cluster_tags,
        max_occupants: req.body.max_occupants,
        is_full: req.body.is_full
    }).then(cluster => {
        if(!cluster) {
            res.status(400).send({
                message: "User can not be found!"
            });
        } else {
            res.status(200).send(user);
        }
    })
    .catch(err => res.status(404).json(err));
    
});

router.get("/cluster/all_clusters", async(req, res) => {
    ClusterProfile.find().then(clusters => {
        return res.status(200).send(clusters);
    });
});

router.get("/cluster/single_cluster/:cluster_id", async(req, res) => {
    ClusterProfile.findOne({ _id: req.params.cluster_id }).then(cluster => {
        if(!cluster) {
            return res.status(404).send({
                message: "The Cluster does not exist."
            })
        } else {
            return res.status(200).send(cluster);
        }
    });
});

router.get("/cluster/all_tags/:cluster_id", async(req, res) => {
    const id = req.params.cluster_id;
    if(!ObjectId.isValid(id)) {
        res.status(400).send({
            message: "You sent an invalid string. This string cannot be converted back to an object ID."
        });
        return;
    }
    Tag.find({tag_clusters: id, is_user_tag: false}).then(tags => {
        return res.status(200).send(tags);
    })
});

router.get("/cluster/all_interests/type_user/:cluster_id", async(req, res) => {
    const id = req.params.cluster_id;

    if(!ObjectId.isValid(id)) {
        res.status(400).send({
            message: "You sent an invalid string. This string cannot be converted back to an object ID."
        });
        return;
    }
    ClusterInterest.find({cluster_id: id, is_cluster: false}).then(interests => {
        return res.status(200).send(interests);
    })
});

router.get("/cluster/all_interests/type_cluster/:cluster_id", async(req, res) => {
    const id = req.params.cluster_id;

    if(!ObjectId.isValid(id)) {
        res.status(400).send({
            message: "You sent an invalid string. This string cannot be converted back to an object ID."
        });
        return;
    }
    ClusterInterest.find({cluster_id: id, is_cluster: true}).then(interests => {
        return res.status(200).send(interests);
    })
});

router.delete("/cluster/delete_interest/:id", async(req, res) => {
    const id = req.params._id;

    if(!ObjectId.isValid(id)) {
        res.status(400).send({
            message: "You sent an invalid string. This string cannot be converted back to an object ID."
        });
        return;

    }
    ClusterInterest.findById(id).then(interest => {
        interest.remove().then(() => res.status(200).send({
            message: "Deleted interest. "
        }));

    }).catch(err => res.status(404).send({
        message: "No interest to delete."
    }));
});



module.exports = router;