document.addEventListener('DOMContentLoaded', function () {
    input.addEventListener('focus', function () {
        typing = true;
    });
    input.addEventListener('blur', function () {
        typing = false;
    });
});


document.onkeyup = function (event) {

    //user pressed and released enter key
    if (event.code === 'Enter') {

        if (!typing) {
            //user is not already typing, focus our chat text form
            input.focus();

        } else {

            //user sent a message, unfocus our chat form
            input.blur();
        }

    }
}
