const fs = require('fs');
const path = require('path');
const Mustache = require('mustache');
const http = require('axios');
const aws4 = require('aws4');
const URL = require('url');

const restaurantsApiRoot = process.env.RESTAURANTS_API;

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
  console.log(`loading restaurants from ${restaurantsApiRoot}...`);
  const url = URL.parse(restaurantsApiRoot);
  const opts = {
    host: url.hostname,
    path: url.pathname,
  };

  aws4.sign(opts);

  const httpReq = http.get(restaurantsApiRoot, {
    headers: opts.headers,
  });
  return (await httpReq).data;
};

// eslint-disable-next-line no-unused-vars
module.exports.handler = async (event, context) => {
  const restaurants = await getRestaurants();
  console.log(`found ${restaurants.length} restaurants`);
  const dayOfWeek = days[new Date().getDay()];
  const html = Mustache.render(template, { dayOfWeek, restaurants });
  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
    },
    body: html,
  };

  return response;
};
