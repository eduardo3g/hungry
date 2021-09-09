const DynamoDB = require('aws-sdk/clients/dynamodb');
const middy = require('@middy/core');
const ssm = require('@middy/ssm');

const DocumentClient = new DynamoDB.DocumentClient();

const { RESTAURANTS_TABLE, SERVICE_NAME, STAGE } = process.env;

const findRestaurantsByTheme = async (theme, limit) => {
  console.log(
    `finding (up to ${limit}) restaurants with the theme ${theme}...`,
  );

  const request = {
    TableName: RESTAURANTS_TABLE,
    Limit: limit,
    FilterExpression: 'contains(themes, :theme)',
    ExpressionAttributeValues: {
      ':theme': theme,
    },
  };

  const response = await DocumentClient.scan(request).promise();

  console.log(`found ${response.Items.length} restaurants`);

  return response.Items;
};

// eslint-disable-next-line no-unused-vars
module.exports.handler = middy(async (event, context) => {
  const request = JSON.parse(event.body);
  const { theme } = request;
  const restaurants = await findRestaurantsByTheme(
    theme,
    context.config.defaultResults,
  );

  console.log(context.secretString);

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
