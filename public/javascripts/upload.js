

$('.upload-btn').on('click', function (){
    $('#upload-input').click();
});

function readURL(files) {
    if (files[0]) {
        var reader = new FileReader();
  
        reader.onload = function (e) {
            $('#image_test')
                .attr('src', e.target.result);
        }
  
        reader.readAsDataURL(files[0]);
    }
  }
  
$('#upload-input').on('change', function(){
    var files = $(this).get(0).files;
 
    readURL(files);
    if (files.length > 0){
      // create a FormData object which will be sent as the data payload in the
      // AJAX request
      var formData = new FormData();
  
      // loop through all the selected files and add them to the formData object
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
  
        // add the files to formData object for the data payload
        formData.append('uploads[]', file, file.name);
      }
  
      $.ajax({
        url: '/upload/upload_request',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(data){
            console.log('upload successful!\n' + data);
        }
      });
  
    }
  });
  