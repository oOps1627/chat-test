$(document).ready(function () {

    var smiles = $("#smilesChoose");
    var inputEl = $("#chatInp");
    var messages = $("div.chat-messages");
    var smileBtn = $("#smilesBtn");

    $('div.chat-message').emotions();
    smiles.emotions();

    $("#smilesChoose span").click(function () {
        var shortCode = $.emotions.shortcode($(this).attr("title"));
        inputEl.val(inputEl.val() + " " + shortCode + " ");
        inputEl.focus()
    });


    smileBtn.click(function () {
        smiles.toggle();
        inputEl.focus();


    });
    $(document).click(function(e) {
        var target = e.target;
        if (target !== smileBtn[0] && target !== smiles[0] && !$.contains(smiles[0], target)) {
            smiles.hide();
        }
    });

});
