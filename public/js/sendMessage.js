var formMessage = document.getElementById('message-form');

socket.on('message', function(data) {
    renderMessage(data);
});

function sendMessage(message) {
    var chat = document.getElementById(currentChatId +'-chat');
    var s = formMessage.message.value;
    s = s.replace(/^\s+|\s+$/g, '');
    if(s) {
        if(window.containsMat(s)){
            alert("Спілкуйся культурно")
        } else {
            socket.emit('message', message, currentChatId);
            formMessage.message.value = "";
            chat.scrollTop = 99999;
        }
    }
}

function renderMessage(data) {
    if(data.chatId !== currentChatId) {
        var badge = $('#'+data.chatId+'-my .badge');
        var badgeVal = +badge.text();
        badge.text(++badgeVal || 1);
    }
    var chat = document.getElementById(data.chatId +'-chat');
    var p = document.createElement('p');
    var date = "<i>" + new Date().toLocaleTimeString() + "</i>";
    var txt = $.emotions(data.message);
    p.innerHTML = date + ' <b>' + data.username + '</b>: ' + txt;
    chat.appendChild(p);
}

