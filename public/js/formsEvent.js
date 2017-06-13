
$("#form-register").on('submit', function (e) {
    e.preventDefault();
    var form = $(this);
    if(!parse(form)) {
        form.parent().find('.status').html('Поля не повинні бути пустими або складатись лише з пробілів');
        return
    }
    $('.error', form).html('');
    $(':submit', form).button('loading');
    $.ajax({
        url: '/form_register',
        method: 'post',
        data: form.serialize(),
        complete: function () {
            $(':submit', form).button('reset');
        },
        statusCode: {
            200: function () {
                form.parent().find('.status').html("Ви успішно зареєструвались").addClass('successfully');
                window.location.href = '/';
            },
            403: function () {
                form.parent().find('.status').html('Користувач з таким логіном вже зареєстрований');
            }
        }
    });
});

$("#form-login").on('submit', function (e) {
    e.preventDefault();
    var form = $(this);

    if(!parse(form)) {
        form.parent().find('.status').html('Поля не повинні бути пустими або складатись лише з пробілів');
        return
    }
    $('.error', form).html('');
    $(':submit', form).button('loading');
    $.ajax({
        url: '/form_login',
        method: 'post',
        data: form.serialize(),
        complete: function () {
            $(':submit', form).button('reset');
        },
        statusCode: {
            200: function () {
                form.parent().find('.status').html("Ви успішно авторизувались").addClass('successfully');
                window.location.href = '/';
            },
            403: function () {
                form.parent().find('.status').html('не правильний логін або пароль');
            }
        }
    });
});


$("#form-logout").on('submit', function (e) {
    e.preventDefault();
    var form = $(this);
    $('.error', form).html('');
    $(':submit', form).button('loading');
    $.ajax({
        url: '/form_logout',
        method: 'post',
        data: form.serialize(),
        complete: function () {
            $(':submit', form).button('reset');
        },
        statusCode: {
            200: function () {
                window.location.href = '/';
            },
            403: function (jqXHR) {
                var error = JSON.parse(jqXHR.responseText);
                $('.error', form).html(error.message);
            }
        }
    });
});

$("#form-create-group").on('submit', function (e) {
    e.preventDefault();
    var s = this.name.value;
    s = s.replace(/^\s+|\s+$/g, '');
    if(s) {
        socket.emit('create group', this.name.value);
    } else {
        $(this).parent().find('.status').html('Поле не повинно бути пустим');
    }
});

function parse(form) {
    var username = form.find("input[name='username']").val();
    var  password = form.find("input[name='password']").val();
    var parseUsername = username.replace(/^\s+|\s+$/g, '');
    var parsePassword = password.replace(/^\s+|\s+$/g, '');

    if(parseUsername && parsePassword){
        return true;
    } else {
        return false
    }
}