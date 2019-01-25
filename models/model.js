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

var Model = function(){

}

Model.AWS = AWS

Model.CONFIG = {	
    "s3_image_bucket": "photofolio-dev-s3-bucket-2",
    "ddb_image_table": "dev-images",
    "ddb_event_table": "dev-events",
    "ddb_user_table" : "dev-users"
} //JSON.parse(fs.readFileSync(__dirname + '/config.json'));

// Returns a promise that returns all events
// output = [event::<string>]
Model.getEvents = function(user_name){

    return ddb.scan({
        TableName: Model.CONFIG.ddb_event_table,
        FilterExpression: '#user_name = :user_name',
        ExpressionAttributeNames : {
            '#user_name': 'user_name'
        },
        ExpressionAttributeValues: {
            ':user_name': {
                'S': user_name
            }
        }
    }).promise().then(data => {
        console.log("DATA: " + data)
        console.log("DATA1: " + data.Items)
        return data.Items.map(event_record => {
            console.log("EVENT_RECORD: " + event_record);
            return event_record.eventt.S
        })
    })

}

Model.addEvent = function(user_name, eventt) {
   return ddb.putItem({
        TableName: Model.CONFIG.ddb_event_table,
        ReturnConsumedCapacity: 'TOTAL',
        Item: {
            user_eventt: {S: user_name + "/" + eventt},
            user_name: {S: user_name  },
            eventt: { S: eventt + "/" }
        }
    }).promise()
}

Model.verifyUser = function(req, res){
    user_name = req.body.user_name;
    password = req.body.password;

    ddb.query({
                TableName: Model.CONFIG.ddb_user_table,
                KeyConditionExpression: 'user_name = :user_name',
                ProjectionExpression: 'user_name, password',
                ExpressionAttributeValues: {
                    ':user_name': { 'S': user_name }
            
                }
    }).promise().then(records => {  console.log(records);
                                    if (((records.Items).length > 0 ) ) {
                                        req.session.user = req.body.user_name;
                                        res.status(200).send({ 
                                            message: "Successful login"
                                            });
                                    } 
                                    else {
                                        res.status(400).send({
                                            message: 'Email Or Password Incorrect'
                                        });
                                    }})

    
}

// Returns promise that returns an image and its metadata
// output = image = { data::<byte data>, meta_data: { filename::<string>, content_type::<string>, eventt::<string> }
Model.getImageByKey = function(image_metadata){
    console.log("HERE")
    s3_uri = `${image_metadata.user_name}/${image_metadata.eventt}/${image_metadata.filename}`
    console.log("S3 URI: " + s3_uri)
    fetchImageP = s3.getObject({
        Bucket: Model.CONFIG.s3_image_bucket,
        Key: s3_uri
    }).promise().then(data => {
        return data.Body
    })

    fetchImageMetadataP = ddb.query({
        TableName: Model.CONFIG.ddb_image_table,
        KeyConditionExpression: 'user_eventt = :user_eventt AND s3_uri = :s3_uri',
        ProjectionExpression: 's3_uri, filename, content_type, eventt, user_name',
        ExpressionAttributeValues: {
            ':user_eventt': {"S": image_metadata.user_name + "/" + image_metadata.eventt },
            ':s3_uri': {"S": s3_uri}
        }
    }).promise().then(image_records => {
        return image_records.Items.map(image_record => {
            return {
                s3_uri: image_record.s3_uri.S,
                user_name: image_record.user_name.S,
                filename: image_record.filename.S,
                content_type: image_record.content_type.S,
                eventt: image_record.eventt.S
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
}

// Returns a promise that returns all images (and assosiated metadata) for a given event
// output = [image]
Model.getImagesByEvent = function(user_name, eventt){
    return ddb.query({
        TableName: Model.CONFIG.ddb_image_table,
        KeyConditionExpression: 'user_eventt = :user_eventt',
        ProjectionExpression: "user_eventt, eventt, filename, user_name",
        ExpressionAttributeValues: {
            ':user_eventt': { 'S': user_name + "/" + eventt }
        }
    }).promise().then(image_records => {
        image_records = image_records.Items.map(image_record => {
 
            var record = {
                eventt: image_record.eventt.S,
                filename: image_record.filename.S,
                user_name: image_record.user_name.S
            }
        
            return record;
        })
        getImagesP = image_records.map(image_record => Model.getImageByKey(image_record))
        return Promise.all(getImagesP)
    })
}

// Returns a promise that uploads an image to s3 and create a DynamoDB metadata record
// output = undefined
Model.uploadImage = function(image_data, image_metadata){
    s3_uri = `${image_metadata.user_name}/${image_metadata.eventt}/${image_metadata.filename}`

    uploadS3 = s3.putObject({
        Body: image_data,
        Bucket: Model.CONFIG.s3_image_bucket,
        Key: s3_uri
    }).promise()

    createDDBEntry = ddb.putItem({
        TableName: Model.CONFIG.ddb_image_table,
        ReturnConsumedCapacity: 'TOTAL',
        Item: {
            user_eventt: {S : image_metadata.user_name + "/" + image_metadata.eventt},
            s3_uri: { S: s3_uri },
            user_name: {S: image_metadata.user_name},
            eventt: { S: image_metadata.eventt },
            filename: { S: image_metadata.filename },
            content_type: { S: image_metadata.content_type },
        }
    }).promise()

    return uploadS3
        .then(() => createDDBEntry)
}

// Returns a promise that delete an image in s3 and deletes its assosiated a DynamoDB metadata record
// output = undefined
Model.deleteImage = function(image_metadata){

    s3_uri = `${image_metadata.user_name}/${image_metadata.eventt}/${image_metadata.filename}`

    deleteDDBEntry = ddb.deleteItem({
        TableName: Model.CONFIG.ddb_image_table,
        Key:{
            user_eventt: {"S": image_metadata.user_name + "/" + image_metadata.eventt},
            eventt: { "S": image_metadata.eventt },
            s3_uri: { "S": s3_uri }
        }
    }).promise()

    deleteObject = s3.deleteObject({
        Bucket: Model.CONFIG.s3_image_bucket,
        Key: s3_uri
    }).promise()

    return deleteOldObject
        .then(() => deleteDDBEntry)
}

// Returns a promise that updates an images DynamoDB metadata and (if necessary) moves the image in S3
// output = undefined
Model.updateImageMetaData = function(old_image_metadata, new_image_metadata){
    old_s3_uri = `${old_image_metadata.user_name}/${old_image_metadata.eventt}/${old_image_metadata.filename}`
    new_s3_uri = `${new_image_metadata.user_name}/${new_image_metadata.eventt}/${new_image_metadata.filename}`

    return s3.copyObject({
        Bucket: Model.CONFIG.s3_image_bucket,
        CopySource: Model.CONFIG.s3_image_bucket + '/' + old_s3_uri,
        Key: new_s3_uri
    }).promise()
    .then(() => {
    	return s3.waitFor('objectExists', {
    		Bucket: Model.CONFIG.s3_image_bucket,
    		Key: new_s3_uri
    	}).promise()
    })
    .then(() => {
        return s3.deleteObject({
            Bucket: Model.CONFIG.s3_image_bucket,
            Key: old_s3_uri
        }).promise()
    })
    .then(() => {
        return ddb.deleteItem({
            TableName: Model.CONFIG.ddb_image_table,
            Key:{
                eventt: { "S": old_image_metadata.eventt },
                s3_uri: { "S": old_s3_uri }
            }
        }).promise()
    })
    .then(() => {
        createDDBEntry = ddb.putItem({
            TableName: Model.CONFIG.ddb_image_table,
            ReturnConsumedCapacity: 'TOTAL',
            Item: {
                s3_uri: { "S": new_s3_uri },
                user_name : {"S" : new_image_metadata.user_name },
                eventt: { "S": new_image_metadata.eventt },
                filename: { "S": new_image_metadata.filename },
                content_type: { "S": new_image_metadata.content_type }
            }
        }).promise()
    })

}

module.exports = Model;
