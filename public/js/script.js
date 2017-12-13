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

socket.on('group created', function(data) {
    var createGroupModal = $('#createGroupModal');
    createGroupModal.modal('hide');
    createGroupModal.find('.status').html('');
    join(data.newGroup, data.isAuthor);
    updateAllGroupList(data.allGroups);
});

socket.on('name is exist', function() {
    $('#createGroupModal').find('.status').html('Таке ім`я вже існує');
});

socket.on('socket-disconnect', function(username, sockets) {
    var chat = document.getElementById(currentChatId +'-chat');
    var p = document.createElement("p");
    p.innerHTML = username + " відключився";

    setTimeout(function(){
        chat.appendChild(p);
    }, 100);

    updateOnlineList(sockets);
});

// join to/left of the chat
$('.all-groups').on('click', function(e) {
    var target = e.target;
    var groupId = target.parentNode.id;

    if(target.classList.contains('join')) {
        socket.emit('join to the group', groupId);
        target.classList.remove('join');
        target.classList.add('left');
    } else if(target.classList.contains('left')) {
        socket.emit('left of the group', groupId);
        target.classList.remove('left');
        target.classList.add('join');
    } else if(target.classList.contains('delete')) {
        socket.emit('delete group', groupId);
        drop(groupId);
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

    } else if(target.classList.contains('list-group-item')){
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

        var item = document.createElement("li");
        var button = document.createElement('button');
        var spanName = document.createElement('span');
        var spanCaret = document.createElement('span');
        var ulDropdown = document.createElement('ul');
        var titleDropdown = document.createElement('li');

        item.id = group._id;
        item.className = "list-group-item";
        spanName.textContent = group.name + ' ';
        spanName.className = 'group-name dropdown-toggle';
        spanName.setAttribute('data-toggle', 'dropdown');
        ulDropdown.className = 'dropdown-menu';
        titleDropdown.textContent = 'Cписок користувачів:';
        spanCaret.className = 'caret';

        ulAllGroups.appendChild(item);
        item.appendChild(spanName);
        item.appendChild(ulDropdown);
        ulDropdown.appendChild(titleDropdown);

        group.usersName.forEach(function(username) {
            var li = document.createElement('li');
            li.textContent = username;
            ulDropdown.appendChild(li);
        });

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

        item.appendChild(button);
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
    var item = document.createElement('li');
    var button = document.createElement('button');
    var spanName = document.createElement('span');
    var ulDropdown = document.createElement('ul');
    var titleDropdown = document.createElement('li');
    var spanCaret = document.createElement('span');
    var spanBadge = document.createElement('span');

    item.id =  newGroup._id + '-my';

    item.className = 'list-group-item';
    spanName.textContent = newGroup.name + ' ';
    spanName.className = 'group-name dropdown-toggle';
    spanName.setAttribute('data-toggle', 'dropdown');
    spanCaret.className = 'caret';
    spanBadge.className = 'badge badge-default badge-pill';
    ulDropdown.className = 'dropdown-menu';
    titleDropdown.textContent = 'Cписок користувачів:';

    if(isAuthor) {
        button.className = 'list-group-btn delete';
    } else {
        button.className = 'list-group-btn left';
    }

    ulMyGroups.appendChild(item);
    item.appendChild(spanName);
    item.appendChild(ulDropdown);
    ulDropdown.appendChild(titleDropdown);

    newGroup.usersName.forEach(function(username) {
        var li = document.createElement('li');
        li.textContent = username;
        ulDropdown.appendChild(li);
    });

    spanName.appendChild(spanCaret);
    item.appendChild(spanBadge);
    item.appendChild(button);

    var mainCol = document.getElementById('main-col');
    var newChat = document.createElement('div');
    var id = parseInt(item.id);
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


