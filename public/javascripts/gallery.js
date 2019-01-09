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

// $.ajax({
//         url: '/open_album',
//         type: 'POST',
//         data: {album_name:folder_name},
//         success: function(data){
//             images = data

//             document.getElementById('test_canvas').src = 'data:image/jpg;base64,' + images[0].data;

//         },
//         error: function(xhr, ajaxOptions, thrownError){
//             console.log("ERROR!");
//             // flashPasswordField();
//             return false;
//         }
//     });
    
// }