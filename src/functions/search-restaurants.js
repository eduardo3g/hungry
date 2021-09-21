const DynamoDB = require('aws-sdk/clients/dynamodb');
const XRay = require('aws-xray-sdk-core');
const ssm = require('@middy/ssm');
const Log = require('@dazn/lambda-powertools-logger');
const wrap = require('@dazn/lambda-powertools-pattern-basic');

const DocumentClient = new DynamoDB.DocumentClient();

XRay.captureAWSClient(DocumentClient.service);

const { RESTAURANTS_TABLE, SERVICE_NAME, STAGE } = process.env;

const findRestaurantsByTheme = async (theme, limit) => {
  Log.debug('getting restaurants by theme from DynamoDB...', {
    tableName: RESTAURANTS_TABLE,
    limit,
    theme,
  });

  const request = {
    TableName: RESTAURANTS_TABLE,
    Limit: limit,
    FilterExpression: 'contains(themes, :theme)',
    ExpressionAttributeValues: {
      ':theme': theme,
    },
  };

  const response = await DocumentClient.scan(request).promise();

  Log.debug('found restaurants', {
    count: response.Items.length,
  });

  return response.Items;
};

// eslint-disable-next-line no-unused-vars
module.exports.handler = wrap(async (event, context) => {
  const request = JSON.parse(event.body);
  const { theme } = request;
  const restaurants = await findRestaurantsByTheme(
    theme,
    context.config.defaultResults,
  );

  // console.log(context.secretString);

  const response = {
    statusCode: 200,
    body: JSON.stringify(restaurants),
  };

  return response;
}).use(
  ssm({
    cache: true,
    cacheExpiry: 1 * 60 * 1000,
    setToContext: true,
    fetchData: {
      config: `/${SERVICE_NAME}/${STAGE}/search-restaurants/config`,
      secretString: `/${SERVICE_NAME}/${STAGE}/search-restaurants/secretString`,
    },
  }),
);
