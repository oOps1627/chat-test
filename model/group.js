var mongoose = require("mongoose");
var autoIncrement = require('mongoose-auto-increment');
mongoose.Promise = global.Promise;

autoIncrement.initialize(mongoose);
var Schema = mongoose.Schema;

var schema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    authorId: {
        type: String,
        required: true
    },
    usersId: [{
        type: String
    }]
});

schema.plugin(autoIncrement.plugin, {
    model: 'Group',
    startAt: 1
});

var Group = mongoose.model('Group', schema);

exports.Group = Group;
