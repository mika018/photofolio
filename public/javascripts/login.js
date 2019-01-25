$('#login_btn').click(function(){
    submitLogin();
})

$('#album_id_btn').click(function(){
    submitAlbumID();
})

var submitLogin = function(){
    var email = $('#login_email').val();
    var pass = $('#login_pass').val();
    var form = {email:email, password:pass}
    // var data_str = JSON.stringify(form);
    $.ajax({
        url: '/login_request',
        type: 'POST',
        data: {email:email, password:pass},
        success: function(data){
            console.log("OK!");
            return true;
        },
        error: function(xhr, ajaxOptions, thrownError){
            console.log("ERROR!");
            // flashPasswordField();
            return false;
        }
    });
}


var submitAlbumID = function(){
 
    var album_name = $('#album_id').val();
    var album_url = 'gallery?album_name=' + album_name;
    window.location.href = album_url;
  
}

var flashPasswordField = function(){
    $('.login_focus-input').addClass('error').delay(2000).queue(function(){
        $('.login_focus-input').delay(5000).removeClass('error');
    });

    $('.login_input').addClass('error').delay(2000).queue(function(){
        $('.login_input').delay(5000).removeClass('error');
    });
    
}