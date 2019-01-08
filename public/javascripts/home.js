

$('.folder').on('click', function(){
    var folder_name = $(this).children('.folder_name').data('album-name');
    openAlbum(folder_name);
})

var openAlbum = function(folder_name){

    $.ajax({
        url: '/open_album',
        type: 'POST',
        data: {album_name:folder_name},
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