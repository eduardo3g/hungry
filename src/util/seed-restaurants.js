const AWS = require('aws-sdk');
require('dotenv').config();

AWS.config.region = 'eu-west-1';
const dynamodb = new AWS.DynamoDB.DocumentClient();

const restaurants = [
  {
    name: 'Fangtasia',
    image: 'https://d2qt42rcwzspd6.cloudfront.net/manning/fangtasia.png',
    themes: ['true blood'],
  },
  {
    name: "Shoney's",
    image: "https://d2qt42rcwzspd6.cloudfront.net/manning/shoney's.png",
    themes: ['cartoon', 'rick and morty'],
  },
  {
    name: "Freddy's BBQ Joint",
    image:
      "https://d2qt42rcwzspd6.cloudfront.net/manning/freddy's+bbq+joint.png",
    themes: ['netflix', 'house of cards'],
  },
  {
    name: 'Pizza Planet',
    image: 'https://d2qt42rcwzspd6.cloudfront.net/manning/pizza+planet.png',
    themes: ['netflix', 'toy story'],
  },
  {
    name: 'Leaky Cauldron',
    image: 'https://d2qt42rcwzspd6.cloudfront.net/manning/leaky+cauldron.png',
    themes: ['movie', 'harry potter'],
  },
  {
    name: "Lil' Bits",
    image: 'https://d2qt42rcwzspd6.cloudfront.net/manning/lil+bits.png',
    themes: ['cartoon', 'rick and morty'],
  },
  {
    name: 'Fancy Eats',
    image: 'https://d2qt42rcwzspd6.cloudfront.net/manning/fancy+eats.png',
    themes: ['cartoon', 'rick and morty'],
  },
  {
    name: 'Don Cuco',
    image: 'https://d2qt42rcwzspd6.cloudfront.net/manning/don%20cuco.png',
    themes: ['cartoon', 'rick and morty'],
  },
];

const putRequests = restaurants.map(restaurant => ({
  PutRequest: {
    Item: restaurant,
  },
}));

const request = {
  RequestItems: {
    [process.env.RESTAURANTS_TABLE]: putRequests,
  },
};

dynamodb
  .batchWrite(request)
  .promise()
  .then(() => console.log('Restaurants seed script has been completed'))
  .catch(err => console.error(err));
