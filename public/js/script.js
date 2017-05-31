var socket = io({transports:['websocket']});

var onlineList = document.getElementById('online-list');
var ulMyGroups = document.getElementById('my-group-list');
var ulAllGroups = document.getElementById('all-group-list');

var currentChatId = '0';

socket.on('update my groups', function(myGroups, id) {
    updateMyGroupList(myGroups, id);
});

socket.on('left of the group', function(groupId) {
    left(groupId);
});

socket.on('socket-connect', function(username, sockets, allGroups, isUnique) {

    if(isUnique) {
        var chat = document.getElementById(currentChatId +'-chat');
        var p = document.createElement("p");
        p.innerHTML = username + " підключився";
        chat.appendChild(p);
    }
    updateOnlineList(sockets);
    updateAllGroupList(allGroups);
});

socket.on('socket-disconnect', function(username, sockets) {
    var chat = document.getElementById(currentChatId +'-chat');
    var p = document.createElement("p");
    p.innerHTML = username + " відключився";
    chat.appendChild(p);
    updateOnlineList(sockets);
});

// join to/left of the chat
$('.all-groups').on('click', function(e) {
    var target = e.target;
    if (target.tagName == 'BUTTON') {
        if(target.classList.contains('join')) {
            socket.emit('join to the group', target.parentNode.id);
            target.classList.remove('join');
            target.classList.add('left');

        } else if(target.classList.contains('left')) {
            socket.emit('left of the group', target.parentNode.id);
            target.classList.remove('left');
            target.classList.add('join');
        }
    }

});


$('#my-group-list').on('click', function(e) {
    var target = e.target;

    if(target.tagName == 'BUTTON') {
        var groupId = parseInt(target.parentNode.id);

        if(target.classList.contains('left')) {
            socket.emit('left of the group', groupId);
            var btnAllGroup = document.getElementById(groupId).getElementsByClassName('list-group-btn')[0];
            btnAllGroup.classList.remove('left');
            btnAllGroup.classList.add('join');

        } else if(target.classList.contains('delete')) {
            socket.emit('delete group', groupId);
            drop(groupId);
        }

    } else if(target.tagName == 'LI'){
        var groupId = parseInt(target.id);
        if(groupId !== currentChatId) {
            $('#'+ currentChatId +'-chat').hide();
            $('#'+ groupId +'-chat').show();
            $('#'+currentChatId+'-my').toggleClass('active');
            $('#'+groupId+'-my').toggleClass('active');
            $('#'+groupId+'-my .badge').text('');
            currentChatId = groupId;
        }
    }
});

function updateOnlineList(sockets) {
    while(onlineList.childNodes[0]){
        onlineList.removeChild(onlineList.childNodes[0]);
    }
    [].forEach.call(sockets, function(socket) {
        var li = document.createElement("li");
        li.innerHTML = socket.username;
        li.className = 'list-group-item';
        onlineList.appendChild(li);
    })
}

function updateAllGroupList(allGroups) {
    //delete all old groups
    while(ulAllGroups.childNodes[0]){
        ulAllGroups.removeChild(ulAllGroups.childNodes[0]);
    }
    [].forEach.call(allGroups, function(group) {

        var li = document.createElement("li");
        var button = document.createElement('button');
        var spanName = document.createElement('span');
        var spanCaret = document.createElement('span');

        li.id = group._id;
        li.className = "list-group-item";
        spanName.textContent = group.name + ' ';
        spanName.className = 'group-name dropdown-toggle';
        spanCaret.className = 'caret';

        ulAllGroups.appendChild(li);
        li.appendChild(spanName);
        spanName.appendChild(spanCaret);

        var isMyGroup;

        for (var i=0; i < ulMyGroups.children.length; i++) {
            var id = parseInt(ulMyGroups.children[i].id);
            if (id == group._id) {
                isMyGroup = ulMyGroups.children[i].getElementsByClassName('list-group-btn')[0];
                break
            }
        }

        if (isMyGroup) { // if i have this button in the list of my groups
            button.className = isMyGroup.classList; // then copy this btn
        } else {
            button.className = "list-group-btn join"; // else create join btn in the list of all groups
        }

        li.appendChild(button);
    })
}

function updateMyGroupList(myGroups, id) {

    if (myGroups instanceof Array) {
        [].forEach.call(myGroups, function(group) {
            var isAuthor = false;
            if(id == group.authorId) isAuthor = true;
            join(group, isAuthor);
        });
    } else {
        var isAuthor = false;
        if(id == myGroups.authorId) isAuthor = true;
        join(myGroups, isAuthor);
    }
}

function join(newGroup, isAuthor) {
    var li = document.createElement('li');
    var button = document.createElement('button');
    var spanName = document.createElement('span');
    var spanCaret = document.createElement('span');
    var spanBadge = document.createElement('span');

    li.id =  newGroup._id + '-my';
    li.className = 'list-group-item';
    spanName.textContent = newGroup.name + ' ';
    spanName.className = 'group-name dropdown-toggle';
    spanCaret.className = 'caret';
    spanBadge.className = 'badge badge-default badge-pill';

    if(isAuthor) {
        button.className = 'list-group-btn delete';
    } else {
        button.className = 'list-group-btn left';
    }

    ulMyGroups.appendChild(li);
    li.appendChild(spanName);
    spanName.appendChild(spanCaret);
    li.appendChild(spanBadge);
    li.appendChild(button);

    var mainCol = document.getElementById('main-col');
    var newChat = document.createElement('div');
    var id = parseInt(li.id);
    newChat.id = id + '-chat';
    newChat.className = "chat";
    newChat.style.display = "none";
    mainCol.insertBefore(newChat, mainCol.children[0].nextSibling);
}

function left(groupId) {
    checkIsActive(groupId);
    $('#'+groupId+'-my').remove();
    $('#'+groupId+'-chat').remove();
    $('#'+groupId+' button').removeClass('left').addClass('join');
}

function drop(groupId) {
    checkIsActive(groupId);
    $('#'+groupId+'-my').remove();
    $('#'+groupId+'-chat').remove();
    $('#'+groupId).remove();
}

function checkIsActive(groupId) {
    if ($('#'+groupId+'-my').hasClass('active')) {
        currentChatId = '0';
        $('#0-my').addClass('active');
        $('#0-chat').show();
    }
}




