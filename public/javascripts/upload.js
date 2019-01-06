$('.upload-btn').on('click', function (){
    console.log("CLICK");
    var files = $('#upload-input').get(0).files;
    postFilesTo(files, '/upload/upload_request');
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

function postFilesTo(files, url) {
    readURL(files);
    if (files.length > 0){
        // create a FormData object which will be sent as the data payload in the
        // AJAX request
        var formData = new FormData();
        formData.append('album_name', $('#album_name_input').val())
        // loop through all the selected files and add them to the formData object
        for (var i = 0; i < files.length; i++) {

            // add the files to formData object for the data payload
            formData.append('uploads[]', files[i], files[i].name);
            console.log(formData)
            $.ajax({
                url: url,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(data){
                    console.log('upload successful!\n' + data);
                }
            });
        }
    }
    else {
        $('#upload-input').click();
    }
}

$('#upload-input').on('change', function(){
    console.log($(this).val())
    if($(this).val() == ''){
        console.log("upload input click failed")
    }
    else {
        console.log("upload input click ")
        $('.upload-btn').addClass('files-ready');
        $('.files-ready').removeClass('upload-btn');
        $('.files-ready').text('Store Album');
    }
})
