$('#login_btn').click(function(){
    submitLogin();
})

$('.login_input').on('focus', function(){
    if($(this).hasClass('error')){
        $('.login_input').removeClass('error');
        $('.login_focus-input').removeClass('error');
    }
})


var submitLogin = function(){
    var email = $('#login_email').val();
    var pass = $('#login_pass').val();
    var form = {email:email, password:pass}
    // var data_str = JSON.stringify(form);
    $.ajax({
        url: '/login/login_request',
        type: 'POST',
        data: {email:email, password:pass},
        success: function(data){
            console.log("OK!");
            return true;
        },
        error: function(xhr, ajaxOptions, thrownError){
            console.log("ERROR!");
            flashPasswordField();
            return false;
        }
    });
}


var flashPasswordField = function(){
    $('.login_focus-input').addClass('error').delay(2000).queue(function(){
        $('.login_focus-input').delay(5000).removeClass('error');
    });

    $('.login_input').addClass('error').delay(2000).queue(function(){
        $('.login_input').delay(5000).removeClass('error');
    });
    
}