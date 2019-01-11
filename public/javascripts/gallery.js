// portfolio
$('.gallery ul li a').click(function() {
    var itemID = $(this).attr('href');
    $('.gallery ul').addClass('item_open');
    $(itemID).addClass('item_open');
    return false;
});
$('.close').click(function() {
    $('.port, .gallery ul').removeClass('item_open');
    return false;
});

$(".gallery ul li a").click(function() {
    $('html, body').animate({
        scrollTop: parseInt($("#top").offset().top)
    }, 400);
});


// LOADS IMAGES
var loadAlbum = function(){
    var folder_name = getUrlParameter('album_name');
    $.ajax({
        url: '/gallery/open_album',
        type: 'POST',
        data: {album_name:folder_name},
        success: function(data){
            // images = data

            // document.getElementById('test_canvas').src = 'data:image/jpg;base64,' + images[0].data;
            for (image of data){
                image_buffer = image.data;
                $('#album_grid').append(loadPhoto(image_buffer))
            }
            console.log("SUCCESS!");
        },
        error: function(error){
            console.log(error);
            // flashPasswordField();
            return false;
        }
    });

}

// Allows user to upload image of his/her face to filter the gallery
var find_me = function(file){
    console.log(JSON.stringify(file))
    var album = getUrlParameter('album_name');
    var formData = new FormData();
    formData.append('uploads[]', file, file.name);
    formData.append('album_name', album);
    $.ajax({
        url: '/gallery/find_me',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(data){
            console.log('upload successful!\n' + data);
        },
        error: function(error){
            console.log(error);
            return false;
        }
    });
}

$('#upload-input').on('change', function(){
    var file = $(this).get(0).files[0];
    find_me(file);
});

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

var loadPhoto = function(image_buffer){
    return   ( '<li>'
                + '<a class="image" href="#item01">' 
                + '<img src="data:image/jpg;base64,' + image_buffer + '" alt="">'
                + '</a>'
                + '</li>')
}