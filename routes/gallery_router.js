var express = require('express');
var router = express.Router();
var path = require('path');
var model = require('../models/model');
var formidable = require('formidable');
var fs = require('fs');

var AWS = model.AWS
var rekognition = new AWS.Rekognition();

function rekognitionParams(sourceImage, targetImage) {
  return {
    SimilarityThreshold: 90, 
    SourceImage: {
     S3Object: {
      Bucket: model.CONFIG.s3_image_bucket, 
      Name: sourceImage
     }
    }, 
    TargetImage: {
     S3Object: {
      Bucket: model.CONFIG.s3_image_bucket, 
      Name: targetImage
     }
    }
   };
}

router.get('/', function(req, res, next){
//   var album_name = req.query.album_name;
  res.render('gallery');
})

router.post('/open_album', function(req, res, next) {
  var album_name = req.body.album_name;
 
  model.getImagesByEvent(album_name)
    .then(images => {
      image_list = []
      images.forEach((image, i) => {
          console.log(image.data)
          metadata = image.metadata[0];
          data = image.data; //new Buffer(encodedImage, 'base64').toString('binary');
          // var img = fs.readFileSync('')
          var content_type = metadata.content_type;
          // fs.writeFile("./file" + i + ".jpg", Buffer.from(image.data), (err) => console.log(err))
          // res.setHead({'Content-Type': content_type})
          // res.end(data, 'binary')
          image_list.push({metadata: metadata, data: data.toString('base64')})
          // res.send(data.toString('base64'))
      })
      res.send(image_list)
  })
  .catch(err => console.log(err))
  // res.send("Got it")
});

router.post('/find_me', function(req, res, next) {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    var file_path = files['uploads[]']['path'];
    var file = fs.readFileSync(file_path);
    var face_metadata = {
      filename : files['uploads[]']['name'],
      content_type : files['uploads[]']['type'],
      eventt : 'faces'
    }
    var album_name = fields['album_name'];
    // console.log(`Album name: ${album_name}`)
    // First upload the provided image to the faces directory inside s3 bucket
    model.uploadImage(file, face_metadata).then(() => {
      console.log("Uploaded it successfully!!!!!")
      // Then pull all the images from the viewed event/album
      model.getImagesByEvent(album_name).then(images => {
        // Now run rekognition api against all those photos
        var face_matching_images = [];
        images.forEach((image) => {
          const params = rekognitionParams(image.metadata[0].s3_uri, `faces/${face_metadata.filename}`)
          // console.log(`Rekognition params: ${JSON.stringify(params)}`)
          rekognition.compareFaces(params, function(err, data) {
            if (err) {
              console.log(err);
            } else if (data.FaceMatches.length > 0) {
              face_matching_images.push({metadata: image.metadata, data: image.data.toString('base64')})
            }
          })
        })
        console.log(`Faces1: ${JSON.stringify(face_matching_images)}`)
        return face_matching_images;
      })
      .then((faces) => {
        console.log(`Faces2: ${JSON.stringify(faces)}`)
        // res.send(face_matching_images);
      })
    })
    .catch(err => console.log(err))
  })
});

module.exports = router;
