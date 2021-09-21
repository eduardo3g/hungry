const EventBridge = require('aws-sdk/clients/eventbridge');
const Log = require('@dazn/lambda-powertools-logger');

const eventBridge = new EventBridge();
const chance = require('chance').Chance();

const { BUS_NAME } = process.env;

module.exports.handler = async event => {
  const { restaurantName } = JSON.parse(event.body);

  const orderId = chance.guid();

  Log.debug('placing order...', { orderId, restaurantName });

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

  Log.debug('published event into EventBridge', {
    eventType: 'order_placed',
    eventBusName: BUS_NAME,
  });

  const response = {
    statusCode: 200,
    body: JSON.stringify({ orderId }),
  };

  return response;
};
