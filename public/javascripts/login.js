$('#login_btn').click(function(){
    submitLogin();
})

$('#album_id_btn').click(function(){
    submitAlbumID();
})

var submitLogin = function(){
    var user = $('#login_email').val();
    var pass = $('#login_pass').val();

    // var data_str = JSON.stringify(form);
    $.ajax({
        url: '/login/login_request',
        type: 'POST',
        data: {user_name:user, password:pass},
        success: function(data){
            console.log(data);
            var href = $('#load_home').attr('href');
            window.location.href = href; 
            return true;
        },
        error: function(xhr, ajaxOptions, thrownError){
            console.log("Wrong Account Information!");
            alert("Wrong Account Information");
            return false;
        }
    });
}


var submitAlbumID = function(){
    var user_name = $('#user_id').val();
    var album_name = $('#album_id').val();
    
    var album_url = 'gallery?album_name=' + album_name + "&user=" + user_name;
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