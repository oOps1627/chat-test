var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
mongoose.Promise = global.Promise;

autoIncrement.initialize(mongoose);
var Schema = mongoose.Schema;

var schema = new Schema ({
    groupId: {
        type: String,
        unique: true,
        required: true
    },
    messages: [{
        value: String,
        authorId: String,
        authorName: String
        //time: String
    }]
});

schema.plugin(autoIncrement.plugin, {
    model: 'Message',
    startAt: 0
});

var Message = mongoose.model('Message', schema);

exports.Message = Message;