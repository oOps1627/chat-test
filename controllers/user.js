var User = require('../model/user').User;

var onlineList=[];

exports.createUser = function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    if(!username || !password || username.length < 4 || username.length > 30) {
        res.sendStatus(403);
        return
    }
    User.findOne({username: username}, function(err, isUser) {
        if(isUser) {
            res.sendStatus(403);
        } else {
            var user = new User({username:username, password:password, rooms:"0"});

            user.save(function(err) {
                if(err) {
                    next(err);
                } else {
                    console.log("user has been saved");
                }
                req.session.user = user._id;
                res.sendStatus(200)
            });
        }
        if (err) next(err);
    });

};

exports.login = function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    User.findOne({username: username}, function(err, user) {
        if (user) {
            if (user.checkPassword(password)) {
                req.session.user = user._id;
                res.sendStatus(200);
            } else {
               // res.send("Не правильний пароль");
                res.sendStatus(403);
            }
        } else {
          //  res.send("Користувач не знайдений");
            res.sendStatus(403);
        }
        if (err) next(err);

    })
};

exports.logout = function(req, res) {
     req.session.destroy();
     res.sendStatus(200);
};

exports.addOnlineList = function(username, id) {
    onlineList.push({id: id, username: username, countOfPages: 1});
};

exports.removeOnlineList = function(id, username, socket) {
    if(id === undefined) return;
    [].forEach.call(onlineList, function(elem, i) {
        if (elem.id.toString() == id.toString()) {
            if (elem.countOfPages - 1 < 1) {
                onlineList.splice(i, 1);
                socket.broadcast.emit("socket-disconnect", username, onlineList);
            } else {
                elem.countOfPages--
            }
        }
    });
};

function checkIsUnique(id) {
    var isUnique = true;
    if(!id) return false;
    [].forEach.call(onlineList, function(elem) {
        if (elem.id.toString() == id.toString()) {
            isUnique = false;
            elem.countOfPages++
        }
    });
    return isUnique
}

exports.checkIsUnique = checkIsUnique;

exports.onlineList = onlineList;