const DynamoDB = require('aws-sdk/clients/dynamodb');

const DocumentClient = new DynamoDB.DocumentClient();

const defaultResults = process.env.DEFAULT_RESULTS || 8;
const tableName = process.env.RESTAURANTS_TABLE;

const getRestaurants = async limit => {
  console.log(`fetching ${limit} restaurants from ${tableName}`);

  const request = {
    TableName: tableName,
    Limit: limit,
  };

  const response = await DocumentClient.scan(request).promise();
  console.log(`found ${response.Items.length} restaurants`);

  return response.Items;
};

// eslint-disable-next-line no-unused-vars
module.exports.handler = async (event, context) => {
  const restaurants = await getRestaurants(defaultResults);

  const response = {
    statusCode: 200,
    body: JSON.stringify(restaurants),
  };

  return response;
};
