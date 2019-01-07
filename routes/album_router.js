var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var model = require('../models/model');
var fs = require('fs');
var AWS = require('aws-sdk');

AWS.config.update({region: 'eu-west-1'});
var rekognition = new AWS.Rekognition();

model.CONFIG = {
	"s3_image_bucket": "photofolio-dev-s3-bucket-2",
	"ddb_image_table": "dev-images",
	"ddb_event_table": "dev-events"
}

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

// router.get('/', function(req, res, next) {
//   res.send(JSON.stringify(makeRekognitionParameter("kita", "muda")))
// });

/* GET album page. */
router.get('/:albumid', function(req, res, next) {
  if (req.params.albumid) {
    // TODO: get event images from the bucket and render them!
    // model.getImagesForEvent(albumid) or something like that.
    res.render('album', { album: req.params.albumid });
  } else {
    res.render('error');
  }
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
    var album_name = fields['album'];
    var face_matching_images = [];
    // First upload the provided image to the faces directory inside s3 bucket
    model.uploadImage(file, face_metadata).then(() => {
      // Then pull all the images from the viewed event/album
      // model.getImagesByEvent('little_litter').then(images => {
      model.getImagesByEvent(album_name).then(images => {
        // Now run rekognition api against all those photos
        images.forEach((image) => {
          var params = rekognitionParams(image.metadata[0].s3_uri, `faces/${face_metadata.filename}`)
          // console.log(JSON.stringify(params))
          rekognition.compareFaces(params, function(err, data) {
            if (err) {
              console.log(err, err.stack);
            } else if (data.FaceMatches.length > 0) {
              face_matching_images.push(image.metadata[0].s3_uri);
            }    
          })
        })
      })
    }).then(() => {
      // Rerender the page with matching images
      res.render('album', album_name, face_matching_images);
    })
  });
});

module.exports = router;
