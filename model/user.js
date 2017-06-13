var mongoose = require("mongoose");
var crypto = require('crypto');

mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
var schema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    hashedPassword: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    rooms: [{
        type: String
    }]
});

schema.methods.encryptPassword = function(password) {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
};

schema.virtual('password')
    .set(function(password) {
        this._plainPassword = password;
        this.salt = Math.random() + '';
        this.hashedPassword = this.encryptPassword(password);
})
    .get(function() { return this._plainPassword; });

schema.methods.checkPassword = function(password) {
    return this.encryptPassword(password) == this.hashedPassword;
};

schema.methods.addRoom = function(groupId, done) {
    this.rooms.push(groupId);
    this.save(function (err) {
        if(err) throw err;
        if(done) done(err);
        console.log('ok')
    });
};

schema.methods.removeRoom = function(groupId, done) {
    var user = this;
    user.rooms.forEach(function(room) {
        if(room == groupId) {
            user.rooms.remove(room);
            user.save(function (err) {
                if (err) throw err;
               if(done) done(err);
            });
        }
    });
};

var User = mongoose.model('User', schema);

exports.User = User;