var model = require("../model.js")

// Setup and Sync Dev S3 Bucket and DynamoDB Tables
require("../dev/setup.js")

// Modify CONFIG to point to Dev resources
model.CONFIG = {
	"s3_image_bucket": "photofolio-dev-s3-bucket",
	"ddb_image_table": "dev-images",
	"ddb_event_table": "dev-events"
}

// TODO
	// getEvents
	// getImageByKey
	// getImageByEvent
	// uploadImage
	// updateImageMetaData



