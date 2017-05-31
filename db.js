var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://andy:1627@ds157278.mlab.com:57278/chat', process.env.MONGOLAB_URI || process.env.MONGOHQ_URL ||'mongodb://localhost/chat');

module.exports = mongoose;