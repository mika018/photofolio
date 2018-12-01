var helpers = require('../helpers.js')
var AWS = require('aws-sdk')
var fs = require('fs')
var _ = require('lodash')
var path = require('path')

CONFIG = JSON.parse(fs.readFileSync('./dev_config.json'))

AWS.config.update({region: 'eu-west-1'})
AWS.config.apiVersions = {
  dynamodb: '2012-08-10',
  s3: '2006-03-01'
}

var ddb = new AWS.DynamoDB()
var s3 = new AWS.S3()

// Create (if not exists) image bucket
function createS3(){
	return s3.createBucket({
		Bucket: CONFIG.s3_image_bucket,
	}).promise().catch(err => {
		if (err.code !== "BucketAlreadyOwnedByYou") throw err
	})
}

// Create (if not exists) images and event DynamoDB table
function createImageTableDynamoDB(){
	return ddb.createTable({
		TableName: CONFIG.ddb_image_table,
		BillingMode: "PROVISIONED",
		ProvisionedThroughput: {
			ReadCapacityUnits: 5,
			WriteCapacityUnits: 5
		},
		AttributeDefinitions: [
			{
				AttributeName: 'eventt',
				AttributeType: 'S'
			},
			{
				AttributeName: 's3_uri',
				AttributeType: 'S'
			}
		],
		KeySchema: [
			{
				AttributeName: 'eventt',
				KeyType: 'HASH'
			},
			{
				AttributeName: "s3_uri",
				KeyType: "RANGE"
			}
		]
	}).promise()
}

function createEventTableDynamoDB(){
	return ddb.createTable({
		TableName: CONFIG.ddb_event_table,
		BillingMode: "PROVISIONED",
		ProvisionedThroughput: {
			ReadCapacityUnits: 5,
			WriteCapacityUnits: 5
		},
		AttributeDefinitions: [
			{
				AttributeName: 'eventt',
				AttributeType: 'S'
			}
		],
		KeySchema: [
			{
				AttributeName: 'eventt',
				KeyType: 'HASH'
			}
		]
	}).promise()
}

function waitTillAvailableImagesTable(){
	return ddb.waitFor('tableExists', { TableName: CONFIG.ddb_image_table }).promise()
}

function waitTillAvailableEventTable(){
	return ddb.waitFor('tableExists', { TableName: CONFIG.ddb_event_table }).promise()
}

function setupDynamoDB(){
 return createImageTableDynamoDB()
	.then(createEventTableDynamoDB)
	.catch(err => {
		if (err.code !== "ResourceInUseException") throw err
	})
	.then(waitTillAvailableImagesTable)
	.then(waitTillAvailableEventTable)
	.catch(err => {
		helpers.exit(err)
	})
}

// List s3 object uris of a given bucket
// then, persist table entries in dynamoDB
function putImageMetaRecord(image_metadata){
	return ddb.putItem({
		TableName: CONFIG.ddb_image_table,
		ReturnConsumedCapacity: "TOTAL",
		Item: {
			"s3_uri": { S: image_metadata.s3_uri },
			"eventt": { S: image_metadata.eventt },
			"filename": { S: image_metadata.filename },
			"content_type": { S: image_metadata.content_type },
		}
	}).promise()
}

function putEventMetaRecord(event_metadata){
	return ddb.putItem({
		TableName: CONFIG.ddb_event_table,
		ReturnConsumedCapacity: "TOTAL",
		Item: {
			"eventt": { S: event_metadata.eventt }
		}
	}).promise()
}

function persistToDynamoDB(){
	return s3.listObjects({
		Bucket: CONFIG.s3_image_bucket,
	}).promise().then(data => {
		all_object_s3_uris = data.Contents.map(obj => obj.Key)
		events = all_object_s3_uris.filter(obj => obj.endsWith("/"))
		image_object_s3_uris = _.difference(all_object_s3_uris, events)
		image_metadatas = image_object_s3_uris.map((image_object_s3_uri) => {
			return {
				s3_uri: image_object_s3_uri,
				eventt: path.dirname(image_object_s3_uri),
				filename: path.basename(image_object_s3_uri),
				content_type: path.extname(image_object_s3_uri)
			}
		})
		event_metadatas = events.map(event => {
			return {
				eventt: event
			}
		})
		return [image_metadatas, event_metadatas]
	}).then(([image_metadatas, event_metadatas]) => {
		putImageMetasP = image_metadatas.map(image_metadata => putImageMetaRecord(image_metadata))
		putEventMetasP = event_metadatas.map(event_metadata => putEventMetaRecord(event_metadata))
		return Promise.all(putImageMetasP + putEventMetasP)
	})
}


function setup(){
	return createS3()
	.then(setupDynamoDB)
	.then(persistToDynamoDB)
	.then(() => {
		console.log("Setup and Sync Successful")
	}).catch(err => {
			helpers.exit(err)
	})
}

setup()
// aimage record persistance - include object metadata i.e. content_type and filename
// DB event record persistant - TODO


