const fs = require('fs');
const path = require('path');
const Log = require('@dazn/lambda-powertools-logger');
const wrap = require('@dazn/lambda-powertools-pattern-basic');
const Mustache = require('mustache');
const http = require('axios');
const aws4 = require('aws4');
const URL = require('url');

const restaurantsApiRoot = process.env.RESTAURANTS_API;
const ordersApiRoot = process.env.ORDERS_API;
const cognitoUserPoolId = process.env.COGNITO_USER_POOL_ID;
const cognitoClientId = process.env.COGNITO_CLIENT_ID;
const awsRegion = process.env.AWS_REGION;

const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const template = fs.readFileSync(
  path.resolve(__dirname, '..', 'static', 'index.html'),
  'utf-8',
);

const getRestaurants = async () => {
  Log.debug('getting restaurants...', { url: restaurantsApiRoot });
  const url = URL.parse(restaurantsApiRoot);
  const opts = {
    host: url.hostname,
    path: url.pathname,
  };

  aws4.sign(opts);

  const httpRequest = http.get(restaurantsApiRoot, {
    headers: opts.headers,
  });
  return (await httpRequest).data;
};

// eslint-disable-next-line no-unused-vars
module.exports.handler = wrap(async (event, context) => {
  const restaurants = await getRestaurants();
  Log.debug('got restaurants', { count: restaurants.length });

  const dayOfWeek = days[new Date().getDay()];

  const view = {
    awsRegion,
    cognitoUserPoolId,
    cognitoClientId,
    dayOfWeek,
    restaurants,
    searchUrl: `${restaurantsApiRoot}/search`,
    placeOrderUrl: `${ordersApiRoot}`,
  };

  const html = Mustache.render(template, view);

  const response = {
    statusCode: 200,
    headers: {
      'content-type': 'text/html; charset=UTF-8',
    },
    body: html,
  };

  return response;
});
