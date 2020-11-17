/* Amplify Params - DO NOT EDIT
    API_AURELIUSWEBAMP_GRAPHQLAPIIDOUTPUT
    API_AURELIUSWEBAMP_SETTINGSTABLE_ARN
    API_AURELIUSWEBAMP_SETTINGSTABLE_NAME
Amplify Params - DO NOT EDIT */

var aws = require('aws-sdk');
var ddb = new aws.DynamoDB();

exports.handler = async (event, context) => {

    let date = new Date();

    if (event.request.userAttributes.sub) {

        let params = {
            Item: {
                'userId': { S: event.request.userAttributes.sub },
                '__typename': { S: 'Settings' },
                'owner': { S: event.userName },
                'settings': { S: '{}' },
                'createdAt': { S: date.toISOString() },
                'updatedAt': { S: date.toISOString() },
            },
            TableName: process.env.API_AURELIUSWEBAMP_SETTINGSTABLE_NAME
    };

    // Call DynamoDB
    try {
        await ddb.putItem(params).promise()
        console.log("Success");
    } catch (err) {
        console.log("Error", err);
    }

    console.log("Success: Everything executed correctly");
    context.done(null, event);
} else {
    console.log("Error: Nothing was written to DynamoDB");
    context.done(null, event);
}
};
