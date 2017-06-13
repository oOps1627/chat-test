var http = require('http');
var socket = require('socket.io');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var controllerUser = require("./controllers/user");
var controllerGroup = require("./controllers/group");

var app = express();
var server = http.createServer(app);
var io = socket(server);

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var mongoose = require('./db');
var SessionStore = new MongoStore({mongooseConnection: mongoose.connection});

var User = require('./model/user').User;
var Group = require('./model/group').Group;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));

var sessionMiddleware = session({
    store:  SessionStore,
    secret: "my secret",
    name: "sid",
    saveUninitialized: false,
    resave: false,
    cookie: {
        path: "/",
        httpOnly: false,
        maxAge: null
    }
});

app.use(sessionMiddleware);

app.post('/form_register', controllerUser.createUser);
app.post('/form_login', controllerUser.login);
app.post('/form_logout', controllerUser.logout);

io.use(function (socket, next) {

    var handshakeData = socket.request;
    var parser = cookieParser("my secret");

    parser(handshakeData, {}, function (err) {
        if(err) throw err;
        var sid = handshakeData.signedCookies["sid"];

        SessionStore.load(sid, function (err, session) {
            if(!session) {
                socket.handshake.user = {username: "Guest"};
                socket.emit('check-authorization', {username:'Гість', authorized: false});
                next();
                return
            };

            if(err) throw err;
            socket.handshake.session = session;

            User.findById(socket.handshake.session.user, function(err, user) {
                if(err) {
                    throw err;
                } else if(!user) {
                    socket.handshake.session.destroy();
                    socket.handshake.user = {username: "Guest"};
                    socket.emit('check-authorization', {username:'Гість', authorized: false});
                } else {
                    socket.handshake.user = user;
                    socket.emit('check-authorization', {username: socket.handshake.user.username, authorized: true});
                }
                next();
            });
        });

    });
});

io.on('connection', function(socket) {
    var username = socket.handshake.user.username;
    var id = socket.handshake.user._id;
    var rooms = socket.handshake.user.rooms;

    socket.join('0');

    if(!id) return;

    if(rooms) {
        rooms.forEach(function(room) {
            socket.join(room);
        });
    }
    var isUnique = controllerUser.checkIsUnique(id);
    if(isUnique) controllerUser.addOnlineList(username, id, socket);

    Group.find({usersId: id}, function(err, groups) {
        if(err) throw err;
        socket.emit("update my groups", groups, id);
        io.sockets.emit("socket-connect", username, controllerUser.onlineList, controllerGroup.groupList, isUnique);
    });

    socket.on('message', function(message, chatId) {
        io.sockets.in(chatId).emit("message", {username: username, message:message, chatId: chatId});
    });

    socket.on('left of the group', function(groupId) {
       controllerGroup.leftOfTheGroup(groupId, id, username, socket);
    });

    socket.on('join to the group', function(groupId) {
        controllerGroup.joinToTheGroup(groupId, id, username, socket);
    });

    socket.on('create group', function(groupName) {
        controllerGroup.createGroup(groupName, id, username, socket);
    });

    socket.on('delete group', function(groupId) {
        controllerGroup.deleteGroup(groupId, id, socket);
    });

    socket.on('disconnect', function() {
        controllerUser.removeOnlineList(id, username, socket);
    });
});


server.listen(process.env.PORT || 3000, function() {
    console.log('server started');
});