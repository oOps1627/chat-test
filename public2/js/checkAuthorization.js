
socket.on('check-authorization', function(data) {
    if(data.authorized) {
        userAuthorized();
    } else {
        userNotAuthorized()
    }
    greet(data.username);
});


function greet(username) {
    var span = $('#greeting');
    span.text(username);
}

function userAuthorized() {
    $('#form-logout').show();
    $('#btn-register').hide();
    $('#btn-login').hide();
}

function userNotAuthorized() {
    $('#form-logout').hide();
    $('#btn-register').show();
    $('#btn-login').show();
}