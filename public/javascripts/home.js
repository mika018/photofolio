
$('.tab-link').on('click', function(){
    var tab_name = $(this).data('tab');
    var tab_url = $($(this).children('.tab-url')[0]).attr('href');
    window.location.href = tab_url;
})

// $('.folder').on('click', function(){
//     var folder_name = $(this).children('.folder_name').data('album-name');
//     openAlbum(folder_name);
// })

// var openAlbum = function(folder_name){
//     $.ajax({
//         url: "/gallery",
//         type: "GET", //send it through get method
//         data: { 
//           album_name : folder_name
//         },
//         success: function(response) {
//             console.log(response)
//             $('body').html(response); 
//             $('docume')
//           //Do Something
//         },
//         error: function(xhr) {
//           //Do Something to handle error
//         }
//       });
// }

