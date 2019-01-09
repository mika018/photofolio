

$('.folder').on('click', function(){
    var folder_name = $(this).children('.folder_name').data('album-name');
    openAlbum(folder_name);
})

var openAlbum = function(folder_name){
    window.location = '/gallery' // + ':' + folder_name
}
 
