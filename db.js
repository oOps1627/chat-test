var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI || process.env.MONGOHQ_URL ||'mongodb://localhost/chat');

module.exports = mongoose;
//'mongodb://andriy1627:f162726@ds157278.mlab.com:57278/chat',