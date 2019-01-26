// portfolio

$('.tab-link').on('click', function(){
    var tab_name = $(this).data('tab');
    var tab_url = $($(this).children('.tab-url')[0]).attr('href');
    window.location.href = tab_url;
})

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

$('#find-me-btn').click(function(){
    $('#upload-input').click();
})

$('#go-back-arrow').click(function(){
    window.location.href = window.location.href ;
})

// LOADS IMAGES
var loadAlbum = function(){
    $('#go-back-arrow').css('visibility', 'hidden');
    var folder_name = getUrlParameter('album_name');
    var user_name = getUrlParameter('user');
    $('.lds-roller-container').css('visibility', 'visible');
    var i = 0
    $.ajax({
        url: '/gallery/open_album',
        type: 'POST',
        data: {album_name:folder_name, user_name: user_name},
        success: function(data){
            // images = data
        
            // document.getElementById('test_canvas').src = 'data:image/jpg;base64,' + images[0].data;
            for (image of data){
                i = i + 1;
                  
                if (i >= data.length){
                    $('.lds-roller-container').css('visibility', 'hidden');
                }
                image_buffer = image.data;
                $('#album_grid').append(loadPhoto(image_buffer))
                $('.album_photo').on('click', function() {
                    $('.enlargeImageModalSource').attr('src', $(this).attr('src'));
                    $('#enlargeImageModal').modal('show');
                    $('#modal-image').imgAreaSelect({
                        handles: true,
                        onSelectEnd: function(img, selection){
                            $('.find-drag-btn').on('click', function(){
                                console.log(selection)
                                var y = getImagePortion(img, selection.x2 - selection.x1, selection.y2 - selection.y1, selection.x1, selection.y1, 2);
                                var blob = dataURItoBlob(y);
                                var formData = new FormData(document.forms[0]);
                                var album = getUrlParameter('album_name');
                                formData.append('album_name', album);
                                formData.append('user_name', user_name);
                                formData.append("uploads[]", blob, "region.jpg");
                                var album_grid = document.getElementById("album_grid");
        
                                while (album_grid.lastChild) {
                                    album_grid.removeChild(album_grid.lastChild);
                                }
                                $('#enlargeImageModal').modal('hide');
                                $('.imgareaselect-outer').css('opacity', '0.0');
                                $('.lds-roller-container').css('visibility', 'visible');
                                $.ajax({
                                    url: '/gallery/find_me',
                                    type: 'POST',
                                    data: formData,
                                    processData: false,
                                    contentType: false,
                                    success: function(data){
                                        console.log(data);
                                        $('#go-back-arrow').css('visibility', 'visible');
                                        for (image of data){
                                            image_buffer = image.data;
                                            $('#album_grid').append(loadPhoto(image_buffer))
                                            $('.album_photo').css('cursor', 'default');
                                        }
                                        $('.lds-roller-container').css('visibility', 'hidden');
                                    },
                                    error: function(error){
                                        console.log(error);
                                        return false;
                                    }
                                });
                            })
                        }
                    });
                });

            }
            console.log("SUCCESS!");
        },
        error: function(error){
            console.log(error);
            // flashPasswordField();
            return false;
        }
    });
    $('body').css('display', 'none');
    $('body').fadeIn(2000);
    $('header').find('h2').text(folder_name);

}

var getImagePortion = function(imgObj, newWidth, newHeight, startX, startY, ratio){
    /* the parameters: - the image element - the new width - the new height - the x point we start taking pixels - the y point we start taking pixels - the ratio */
    //set up canvas for thumbnail
    var tnCanvas = document.createElement('canvas');
    var tnCanvasContext = tnCanvas.getContext('2d');
    tnCanvas.width = newWidth; tnCanvas.height = newHeight;
    
    /* use the sourceCanvas to duplicate the entire image. This step was crucial for iOS4 and under devices. Follow the link at the end of this post to see what happens when you don’t do this */
    var bufferCanvas = document.createElement('canvas');
    var bufferContext = bufferCanvas.getContext('2d');
    bufferCanvas.width = imgObj.width;
    bufferCanvas.height = imgObj.height;
    bufferContext.drawImage(imgObj, 0, 0);
    
    /* now we use the drawImage method to take the pixels from our bufferCanvas and draw them into our thumbnail canvas */
    tnCanvasContext.drawImage(bufferCanvas, startX,startY,newWidth * ratio, newHeight * ratio,0,0,newWidth,newHeight);
    return tnCanvas.toDataURL();
}

// Allows user to upload image of his/her face to filter the gallery
var find_me = function(file){
    console.log(JSON.stringify(file))
    var album = getUrlParameter('album_name');
    var user_name = getUrlParameter('user');
    var formData = new FormData();
    formData.append('uploads[]', file, file.name);
    formData.append('album_name', album);
    formData.append('user_name', user_name);
    var album_grid = document.getElementById("album_grid");

    while (album_grid.lastChild) {
        album_grid.removeChild(album_grid.lastChild);
    }
    $('.lds-roller-container').css('visibility', 'visible');
    $.ajax({
        url: '/gallery/find_me',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(data){
            console.log('finding successful!\n');

            for (image of data){
                image_buffer = image.data;
                $('#album_grid').append(loadPhoto(image_buffer))
                $('.album_photo').css('cursor', 'default');
            }
            $('.lds-roller-container').css('visibility', 'hidden');
            $('#find-me-btn').css('visibility', 'hidden');
            $('#go-back-arrow').css('visibility', 'visible');
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

function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type:mimeString});
}

var loadPhoto = function(image_buffer){
    return   ( '<li>'
                + '<a class="image" >' 
                + '<img class="album_photo" src="data:image/jpg;base64,' + image_buffer + '" alt="">'
                + '</a>'
                + '</li>')
}