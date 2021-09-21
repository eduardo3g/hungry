const DynamoDB = require('aws-sdk/clients/dynamodb');
const XRay = require('aws-xray-sdk-core');
const ssm = require('@middy/ssm');
const Log = require('@dazn/lambda-powertools-logger');
const wrap = require('@dazn/lambda-powertools-pattern-basic');

const DocumentClient = new DynamoDB.DocumentClient();

XRay.captureAWSClient(DocumentClient.service);

const { RESTAURANTS_TABLE, STAGE, SERVICE_NAME } = process.env;

const getRestaurants = async limit => {
  Log.debug('getting restaurants from DynamoDB...', {
    limit,
    tableName: RESTAURANTS_TABLE,
  });

  const request = {
    TableName: RESTAURANTS_TABLE,
    Limit: limit,
  };

  const response = await DocumentClient.scan(request).promise();

  Log.debug('found restaurants', {
    count: response.Items.length,
  });

  return response.Items;
};

// eslint-disable-next-line no-unused-vars
module.exports.handler = wrap(async (event, context) => {
  const restaurants = await getRestaurants(context.config.defaultResults);

  const response = {
    statusCode: 200,
    body: JSON.stringify(restaurants),
  };

  return response;
}).use(
  ssm({
    cache: true, // cache SSM parameter value (reduce requests to SSM Parameter Store)
    cacheExpiry: 1 * 60 * 1000,
    setToContext: true, // required to store the parameter value in the context, instead of environment variable
    fetchData: {
      config: `/${SERVICE_NAME}/${STAGE}/get-restaurants/config`, // Parameter name of SSM Parameter Store
    },
  }),
);
