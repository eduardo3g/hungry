const DynamoDB = require('aws-sdk/clients/dynamodb');

const DocumentClient = new DynamoDB.DocumentClient();

const defaultResults = process.env.DEFAULT_RESULTS || 8;
const tableName = process.env.RESTAURANTS_TABLE;

const findRestaurantsByTheme = async (theme, limit) => {
  console.log(
    `finding (up to ${limit}) restaurants with the theme ${theme}...`,
  );

  const request = {
    TableName: tableName,
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
module.exports.handler = async (event, context) => {
  const request = JSON.parse(event.body);
  const { theme } = request;
  const restaurants = await findRestaurantsByTheme(theme, defaultResults);

  const response = {
    statusCode: 200,
    body: JSON.stringify(restaurants),
  };

  return response;
};
