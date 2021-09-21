const XRay = require('aws-xray-sdk-core');
const Log = require('@dazn/lambda-powertools-logger');
const wrap = require('@dazn/lambda-powertools-pattern-basic');
const CorrelationIds = require('@dazn/lambda-powertools-correlation-ids');

const eventBridge = XRay.captureAWSClient(
  require('@dazn/lambda-powertools-eventbridge-client'),
);
const chance = require('chance').Chance();

const { BUS_NAME } = process.env;

module.exports.handler = wrap(async event => {
  const { restaurantName } = JSON.parse(event.body);

  const orderId = chance.guid();

  // Automatically includes in the logs
  const userId = event.requestContext.authorizer.claims.sub;
  CorrelationIds.set('userId', userId);
  CorrelationIds.set('orderId', orderId);
  CorrelationIds.set('restaurantName', restaurantName);

  Log.debug('placing order...');

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
});
