
$("#form-register").on('submit', function (e) {
    e.preventDefault();
    var form = $(this);
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
                form.html("Ви успішно зареєструвались").addClass('alert-success');
                window.location.href = '/';
            },
            403: function () {
                form.parent().find('h3').html('Користувач з таким логіном вже зареєстрований').css('color', 'red')
            }
        }
    });
});

$("#form-login").on('submit', function (e) {
    e.preventDefault();
    var form = $(this);
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
                form.html("Вы увійшли в сайт").addClass('alert-success');
                window.location.href = '/';
            },
            403: function () {
                form.parent().find('h3').html('не правильний логін або пароль').css('color', 'red')
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
                form.html("Ви успішно зареєструвались").addClass('alert-success');
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
    var form = $(this);
    $('.error', form).html('');
    $(':submit', form).button('loading');
    $.ajax({
        url: '/form_createGroup',
        method: 'get',
        data: form.serialize(),
        complete: function () {
            $(':submit', form).button('reset');
        },
        statusCode: {
            200: function (data) {
                join(data.newGroup, data.isAuthor);
                updateAllGroupList(data.allGroups);
            },
            403: function () {

            }
        }
    });
});

