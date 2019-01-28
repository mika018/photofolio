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
  if(req.session.user) 
    res.render('gallery', ({logged_in: true}));
  else 
    res.render('gallery', ({logged_in: false}));
})

router.post('/open_album', function(req, res, next) {
  var album_name = req.body.album_name;
  var user_name = req.body.user_name;

  model.getImageCloudFrontURLsByEvent(user_name, album_name)
    .then(images => {
      
      res.send(images)
  })
  .catch(err => console.log(err))

  // model.getImagesByEvent(user_name, album_name)
  //   .then(images => {
  //     image_list = []
  //     images.forEach((image, i) => {
  //         console.log(image.data)
  //         metadata = image.metadata[0];
  //         data = image.data;
  //         var content_type = metadata.content_type;

  //         image_list.push({metadata: metadata, data: data.toString('base64')})
        
  //     })
  //     res.send(image_list)
  // })
  // .catch(err => console.log(err))
  
});

router.post('/image_data', function(req, res, next){
  var s3_uri = req.body.s3_uri; 
  console.log(req.body)
  model.getImageByS3URI(s3_uri)
    .then(image => {
      data = image;
      res.send(data.toString('base64'));
    }).catch(err => console.log(err))
})

router.post('/find_me', function(req, res, next) {
  console.log("FIND ME")
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    var file_path = files['uploads[]']['path'];
    var file = fs.readFileSync(file_path);
    var face_metadata = {
      filename : files['uploads[]']['name'],
      user_name : 'faces',
      content_type : files['uploads[]']['type'],
      eventt : 'faces',
      user_eventt : 'faces/faces'
    }
    var user_name = fields['user_name'];
    var album_name = fields['album_name'];
    // console.log(`Album name: ${album_name}`)
    // First upload the provided image to the faces directory inside s3 bucket
    model.uploadImage(file, face_metadata).then(() => {
      // Then pull all the images from the viewed event/album
      model.getImageS3URIsByEvent(user_name, album_name)
           .then(s3_uris => {
                  // Now run rekognition api against all those photos
                  var face_matching_images = [];
                  var itemsProcessed = 0;
                  s3_uris.forEach((s3_uri) => {
                    const params = rekognitionParams(s3_uri, `faces/faces/${face_metadata.filename}`)
                    console.log(`Rekognition params: ${JSON.stringify(params)}`)
                    rekognition.compareFaces(params, function(err, data) {
                      if (err) {
                        itemsProcessed++; 
                        if (itemsProcessed === s3_uris.length){
                          res.send(face_matching_images);
                        }
                      } else if (data.FaceMatches.length > 0) {
                        console.log("MATCH");
                          face_matching_images.push(s3_uri)
                          itemsProcessed++;  
                          if (itemsProcessed === s3_uris.length){
                            res.send(face_matching_images);
                          }
                      } else {
                          itemsProcessed++;
                          if (itemsProcessed === s3_uris.length){
                            res.send(face_matching_images);
                          }
                      }
                    })
                  })
              })
    })
    .catch(err => console.log(err))
  })
});

module.exports = router;
