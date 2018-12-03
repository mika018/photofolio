var helpers = require('./helpers.js')
var AWS = require('aws-sdk')
var fs = require('fs')
var _ = require('lodash')
var path = require('path')

AWS.config.update({region: 'eu-west-1'})
AWS.config.apiVersions = {
  dynamodb: '2012-08-10',
  s3: '2006-03-01'
}

var ddb = new AWS.DynamoDB()
var s3 = new AWS.S3()

module.exports = {
	CONFIG: JSON.parse(fs.readFileSync('./config.json')),

	// Returns a promise that returns all events
	getEvents: function(){
		return ddb.scan({
			TableName: CONFIG.ddb_event_table,
			ProjectionExpression: "eventt"
		}).promise().then(data => {
			return data.Items.map(event_record => {
				return event_record.eventt.S
			})
		})
	},

	// Returns promise that returns an image and its metadata
	getImageByKey: function(image_meta){

		s3_uri = `${image_meta.eventt}/${image_meta.filename}`

		fetchImageP = s3.getObject({
			Bucket: CONFIG.s3_image_bucket,
			Key: s3_uri
		}).promise().then(data => {
			return data.Body
		})

		fetchImageMetadataP = ddb.query({
			TableName: CONFIG.ddb_image_table,
			KeyConditionExpression: 'eventt = :eventt AND s3_uri = :s3_uri',
			ProjectionExpression: 's3_uri, filename, content_type, eventt',
			ExpressionAttributeValues: {
				':s3_uri': { 'S': s3_uri },
				':eventt': { 'S': image_meta.eventt }
			}
		}).promise().then(image_records => {
			return image_records.Items.map(image_record => {
				return {
					s3_uri: image_record.s3_uri.S,
					filename: image_record.filename.S,
					content_type: image_record.content_type.S,
					event: image_record.content_type.S
				}
			})
		})

		return Promise.all([fetchImageP, fetchImageMetadataP])
		.then(([image_data, image_metadata]) => {
			return {
				data: image_data,
				metadata: image_metadata
			}
		})
	},

	// Returns a promise that returns all images (and assosiated metadata) for a given event
	getImageByEvent: function(eventt){

		return ddb.query({
			TableName: CONFIG.ddb_image_table,
			KeyConditionExpression: 'eventt = :ev',
			ProjectionExpression: "eventt, s3_uri",
			ExpressionAttributeValues: {
				':evt': { 'S': eventt }
			}
		}).promise().then(image_records => {
			image_records = image_records.Items.map(image_record => {
				return {
					eventt: image_record.eventt.S,
					s3_uri: image_record.s3_uri.S
				}
			})
			getImagesP = image_records.map(image_record => getImageByKey(image_record.s3_uri))
			return Promise.all(getImagesP)
		})
	},

	// Returns a promise that uploads an image to s3 and create a DynamoDB metadata record
	uploadImage: function(image_data, image_metadata){

		s3_uri = `${image_metadata.eventt}/${image_metadata.filename}`

		uploadS3 = s3.putObject({
			Body: image_data,
			Bucket: CONFIG.s3_image_bucket,
			Key: s3_uri
		}).promise()

		createDDBEntry = ddb.putItem({
			TableName: CONFIG.ddb_image_table,
			ReturnConsumedCapacity: 'TOTAL',
			Item: {
				s3_uri: { S: s3_uri },
				eventt: { S: image_metadata.eventt },
				filename: { S: image_metadata.filename },
				content_type: { S: image_metadata.content_type },
			}
		}).promise()

		return uploadS3
			.then(() => createDDBEntry)
	},

	// Returns a promise that updates an images DynamoDB metadata and (if necessary) moves the image in S3
	updateImageMetaData: function(old_image_metadata, new_image_metadata){
		old_s3_uri = `${old_old_image_metadata.eventt}/${old_old_image_metadata.filename}.${old_old_image_metadata.content_type}`
		new_s3_uri = `${new_image_metadata.eventt}/${new_image_metadata.filename}.${new_image_metadata.content_type}`

		updateDDBRecord = ddb.updateItem({
			Key: {
				"s3_uri": { S: old_s3_uri },
				"eventt": { S: old_image_metadata.eventt }
			},
			UpdateExpression: `SET s3_uri = ${new_s3_uri}, eventt = ${new_eventt}, filename: ${new_image_metadata.filename}, content_type: ${new_image_metadata.content_type}`
		}).promise()

		copyObject = ddb.copyObject({
			Bucket: CONFIG.s3_image_bucket,
			CopySource: old_s3_uri,
			Key: new_s3_uri
		}).promise()

		deleteOldObject = ddb.deleteObject({
			Bucket: CONFIG.s3_image_bucket,
			Key: old_s3_uri
		}).promise()

		moveObject = copyObject.then(() => deleteOldObject)
		if (old_s3_uri !== new_s3_uri) return updateDDBRecord.then(() => moveObject)
		else return updateDDBRecord
	}
}








