const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017');
module.exports = mongoose;

// 'mongodb://oops:162726@ds157278.mlab.com:57278/chat'
// 'mongodb://localhost/chat'
