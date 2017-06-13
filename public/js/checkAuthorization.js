
socket.on('check-authorization', function(data) {
    if(data.authorized) {
        userAuthorized();

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
    } else {
        userNotAuthorized();

        socket.on('socket-connect', function(username, sockets, allGroups, isUnique) {
            if(isUnique) {
                var chat = document.getElementById(currentChatId +'-chat');
                var p = document.createElement("p");
                p.innerHTML = username + " підключився";
                chat.appendChild(p);
            }
        });
    }
    greet(data.username);
});


function greet(username) {
    var span = $('#greeting');
    span.text(username);
}

function userAuthorized() {
    $('#form-logout').show();
    $('.message-box').show();
    $('.my-groups .create').css('display', 'block');
    $('#btn-register').hide();
    $('#btn-login').hide();
}

function userNotAuthorized() {
    $('#form-logout').hide();
    $('#btn-register').show();
    $('#btn-login').show();
    $('#notice').html('Для того, щоб надсилати повідомлення, переглядати список кімнат і користувачів потрібно зареєструватись')
}
