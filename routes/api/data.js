const express = require("express");
const async = require("async");
const router = express.Router();
const UserInterest = require("../../models/UserInterest");
const UserProfile = require("../../models/UserProfile");
const Tag = require("../../models/Tag");
const { check, validationResult } = require("express-validator");
var ObjectId = require("mongodb").ObjectId;

router.post("/tag/create", [
    check("is_user_tag").notEmpty().isBoolean(),
    check("category").notEmpty().isString(),
    check("tag_content").notEmpty().isString(),
    check("tag_users").isArray()
], (req, res) => {
    const schemaValidationErrors = validationResult(req);
    if(!schemaValidationErrors.isEmpty()) {
        return res.status(404).send({
            message: "The inputs you entered to create a tag are invalid."
        })
    }

    Tag.findOne({tag_content: req.body.tag_content}).then(user => {
        if(user) {
            return res.status(404).send({
                message: "The tag already exists."
            })
        } else {
            const newTag = new Tag(req.body);
            newTag.save().catch(err => console.log(err));
            return res.status(201).send(newTag);
        }
    })

});

router.delete("/tag/delete/:id", (req, res) => {
    const id = req.params._id;

    if(!ObjectId.isValid(id)) {
        res.status(400).send({
            message: "You sent an invalid string. This string cannot be converted back to an object ID."
        });
        return;
    }
    Tag.findById(id).then(deletedTag => {
        deletedTag.remove().then(() => res.status(200).send({
            message: "Deleted tag" + id
        }));
    }).catch(err => res.status(404).send({
        message: "No tag to delete"
    }))
});




module.exports = router