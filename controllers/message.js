var Message = require('../model/message').Message;

exports.saveMessage = function(authorId, authorName, value, groupId) {
    if(!authorId || !groupId) return;

    Message.findOne({groupId: groupId}, function(err, messagesGroup) {
        if(!messagesGroup) {
            var message = new Message({
                groupId:groupId,
                messages:[{
                    value:value,
                    authorId:authorId,
                    authorName:authorName
                }]
            });
                message.save(function(err) {
                    if (err) console.log(err);
                })
        } else {
            messagesGroup.messages.push({
                value: value,
                authorId: authorId,
                authorName: authorName
                //time: time
            });

            messagesGroup.save(function(err) {
                if (err) console.log(err);
            });
        }
        if (err) next(err);
    } )
};

exports.getMessages = function(room, socket) {
  Message.findOne({groupId: room}, function(err, messagesGroup){
      if(err) next(err);
      if(messagesGroup) socket.emit('load messages', room, messagesGroup.messages);
})
};