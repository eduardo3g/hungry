const EventBridge = require('aws-sdk/clients/eventbridge');

const eventBridge = new EventBridge();
const chance = require('chance').Chance();

const { BUS_NAME } = process.env;

module.exports.handler = async event => {
  const { restaurantName } = JSON.parse(event.body);

  const orderId = chance.guid();
  console.log(`placing order ID [${orderId}] to [${restaurantName}]`);

  await eventBridge
    .putEvents({
      Entries: [
        {
          Source: 'hungry',
          DetailType: 'order_placed',
          Detail: JSON.stringify({
            orderId,
            restaurantName,
          }),
          EventBusName: BUS_NAME,
        },
      ],
    })
    .promise();

  console.log(`published 'order_placed' event into EventBridge`);

  const response = {
    statusCode: 200,
    body: JSON.stringify({ orderId }),
  };

  return response;
};
