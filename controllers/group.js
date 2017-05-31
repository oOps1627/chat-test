var Group = require('../model/group').Group;
var User = require('../model/user').User;

var groupList = [];

Group.find({}, function(err, groups) {
    if(err) throw err;
    groups.forEach(function(group) {
        groupList.push(group)
    })
});

exports.createGroup = function(req, res, next) {
    var name = req.query.name;
    var userId = req.session.user;

    if(!name || !userId) {
        res.sendStatus(403);
        return;
    }
    Group.findOne({name: name}, function(err, isGroup) {
        if(isGroup) {
            res.sendStatus(403);
            return;
        } else {
            var group = new Group({name: name, authorId: userId});
            group.usersId.push(userId);

            group.save(function(err) {
                if(err) next(err);
                console.log("group created");
                groupList.push(group);
                User.findOne({_id: userId}, function(err, user) {
                    if (err) next();
                    user.addRoom(group._id);
                });
                res.status(200);
                res.send({newGroup: group, isAuthor:true, allGroups:groupList});
            });
        }
        if (err) next(err);
    });
};

exports.joinToTheGroup = function(groupId, id, socket) {
    Group.findOne({_id: groupId}, function(err, group) {
        if(!group) return;
        if(err) throw err;

        var isUser = false;

        group.usersId.forEach(function(userId) {
            if(userId === id) {
                isUser = true;
                return
            }
        });

        if(!isUser) {
            group.usersId.push(id);

            group.save(function(err) {
                if(err) throw err;
                Group.find({usersId: id}, function(err, groups) {
                    if(err) throw err;

                    User.findOne({_id: id}, function(err, user) {
                        if(err) throw err;
                        user.addRoom(group._id);
                        socket.join(groupId);
                    });
                    socket.emit("update my groups", group, id);
                });
            });
        }
    });
};

exports.leftOfTheGroup = function(groupId, id, socket) {

    Group.findOne({_id: groupId}, function(err, group) {
        if(err) throw err;
        if(!group) return;
        group.usersId.forEach(function(userId) {
            if(userId == id) {
                group.usersId.remove(id);

                group.save(function(err) {
                    if(err) throw err;

                    User.findOne({_id: id}, function(err, user) {
                        if(err) throw err;
                        user.removeRoom(group._id);
                        socket.leave(groupId);
                        socket.emit("left of the group", groupId);
                    });
                });

                return
            }
        });

    });
};

exports.deleteGroup = function(groupId, id, socket) {
    Group.findOne({_id: groupId}, function (err, group) {
       if(err) throw err;
       if(!group) return;
       if(id == group.authorId) {

           groupList.forEach(function(elem, i) {
               if(elem._id === group._id) {
                   groupList.splice(i, 1);
                   return;
               }
           });

           User.find({}, function(err, users) {
               if(err) throw err;
              users.forEach(function(user) {
                  user.removeRoom(group._id);
                  socket.leave(groupId);
                  group.remove(function(err) {
                      if(err) throw err;
                  });
              });
           });


       }
    });
};

exports.groupList = groupList;