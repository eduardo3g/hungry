const DynamoDB = require('aws-sdk/clients/dynamodb');
const middy = require('@middy/core');
const ssm = require('@middy/ssm');

const DocumentClient = new DynamoDB.DocumentClient();

const { RESTAURANTS_TABLE, STAGE, SERVICE_NAME } = process.env;

const getRestaurants = async limit => {
  console.log(`fetching ${limit} restaurants from ${RESTAURANTS_TABLE}`);

  const request = {
    TableName: RESTAURANTS_TABLE,
    Limit: limit,
  };

  const response = await DocumentClient.scan(request).promise();
  console.log(`found ${response.Items.length} restaurants`);

  return response.Items;
};

// eslint-disable-next-line no-unused-vars
module.exports.handler = middy(async (event, context) => {
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
