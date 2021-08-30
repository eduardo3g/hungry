const fs = require('fs');
const path = require('path');
const Mustache = require('mustache');
const http = require('axios');

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

let html;

function loadHtml() {
  if (!html) {
    console.log('loading index.html...');
    html = fs.readFileSync(
      path.resolve(__dirname, '..', 'static', 'index.html'),
      'utf-8',
    );
    console.log('loaded index.html');
  }

  return html;
}

const getRestaurants = async () => {
  const httpRequest = http.get(restaurantsApiRoot);
  return (await httpRequest).data;
};

// eslint-disable-next-line no-unused-vars
module.exports.handler = async (event, context) => {
  const template = loadHtml();
  const restaurants = await getRestaurants();
  console.log(`restaurants`, restaurants);
  const dayOfWeek = days[new Date().getDay()];
  const html = Mustache.render(template, { dayOfWeek, restaurants });
  console.log('html', html);

  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
    },
    body: html,
  };

  return response;
};
