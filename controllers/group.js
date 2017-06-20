var async = require('async');
var Group = require('../model/group').Group;
var User = require('../model/user').User;

var groupList = [];

Group.find({}, function(err, groups) {
    if(err) throw err;
    groups.forEach(function(group) {
        groupList.push(group)
    })
});

exports.createGroup = function(groupName, userId, username, socket) {
    if(!groupName || !userId) {
        return;
    }
    Group.findOne({name: groupName}, function(err, isGroup) {
        if (err) next(err);
        if(isGroup) {
            socket.emit('name is exist');
            return;
        } else {
            var group = new Group({
                name: groupName,
                authorId: userId,
                usersId:userId,
                usersName:username
            });

            User.findOne({_id: userId}, function(err, user) {
                if (err) throw err;

                group.save(function(err) {
                    if(err) throw err;

                    groupList.push(group);
                    user.addRoom(group._id);

                    socket.join(group._id);
                    socket.emit('group created', {
                        newGroup: group,
                        isAuthor:true,
                        allGroups:groupList
                    });
                });
            });
        }

    });
};

exports.joinToTheGroup = function(groupId, id, username, socket) {
    if(!id) return;
    Group.findOne({_id: groupId}, function(err, group) {
        if(!group) return;
        if(err) throw err;

        var isUser = false;

        group.usersId.forEach(function(userId) {
            if (userId == id) {
                isUser = true;
                return
            }
        });

        if(!isUser) {
            async.waterfall([
                function(done) {
                    group.usersId.push(id);
                    group.usersName.push(username);
                    group.save(function(err) {
                        done(err)
                    })
                },
                function(done) {
                    groupList.forEach(function(elem) {
                        if(group._id == elem._id) {
                            elem.usersId.push(id);
                            elem.usersName.push(username);
                            return
                        }
                    });

                    User.findOne({_id: id}, done);
                },
                function(user, done) {
                    user.addRoom(group._id, done);
                }
            ], function(err) {
                if(err) console.log(err);

                socket.join(groupId);
                socket.emit("update my groups", group, id);
            });

        }
    });
};

exports.leftOfTheGroup = function(groupId, id, username, socket) {
    if(!id) return;
    Group.findOne({_id: groupId}, function(err, group) {
        if(err) throw err;
        if(!group) return;
        group.usersId.forEach(function(userId) {
            if(userId == id) {
                group.usersId.remove(id);
                group.usersName.remove(username);

               async.waterfall([
                   function(done) {
                       group.save(function(err) {
                           done(err);
                       });
                   },
                   function(done) {

                       groupList.forEach(function(elem) {
                           if(group._id == elem._id) {
                               elem.usersId.forEach(function(userId, i) {
                                   if(userId == id) elem.usersId.splice(i, 1);
                               });
                               elem.usersName.forEach(function(userName, i) {
                                   if(userName == username) elem.usersName.splice(i, 1);
                               });
                               return
                           }
                       });

                       User.findOne({_id: id}, done);
                   },
                   function(user, done) {
                       socket.leave(groupId);
                       user.removeRoom(group._id, done);
                   }
               ], function(err) {
                   if(err) console.log(err);
                   socket.emit("left of the group", groupId);
               });

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