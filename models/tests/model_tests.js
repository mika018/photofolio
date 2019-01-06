const model = require("../model.js")
const fs = require('fs');

// Setup and Sync Dev S3 Bucket and DynamoDB Tables
// require("../dev/setup.js")

// Modify CONFIG to point to Dev resources
model.CONFIG = {
	"s3_image_bucket": "photofolio-dev-s3-bucket-2",
	"ddb_image_table": "dev-images",
	"ddb_event_table": "dev-events"
}
var eventt = "a_colourful_world"
var filename = "b1-f1.jpg"
var file = fs.readFileSync("./file.jpg")

// getEvents
// model.getEvents()
// .then(events => console.log("events: " + events))
// .catch(err => console.log("err: " + err))

// getImageByKey
// model.getImageByKey({"eventt": eventt, "filename": filename})
// .then(image => {
//     console.log(JSON.stringify(image.metadata))
//     fs.writeFile("./file.jpg", Buffer.from(image.data), (err) => console.log(err))
// })

// getImagesByEvent
// model.getImagesByEvent(eventt)
// .then(images => {
//     images.forEach((image, i) => {
//         console.log(JSON.stringify(image.metadata))
//         fs.writeFile("./file" + i + ".jpg", Buffer.from(image.data), (err) => console.log(err))
//     })
// })
// .catch(err => console.log(err))

// uploadImage

// deleteImage
// model.deleteImage({eventt: eventt, filename: "newfile.jpg"})
// .then(data => console.log(data))
// .catch(err => console.log(err))

// updateImageMetaData
// model.uploadImage(file, {eventt: eventt, filename: "newfile.jpg", content_type: ".jpg"})
// .then(data => console.log(data))
// .catch(err => console.log(err))
// .then(() => model.updateImageMetaData({eventt: eventt, filename: "newfile.jpg", content_type: ".jpg"}, {eventt: eventt, filename: "newfile1.jpg", content_type: ".jpg"}))
// .then(data => console.log(data))
// .catch(err => console.log(err))

































