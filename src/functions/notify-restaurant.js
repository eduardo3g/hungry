const EventBridge = require('aws-sdk/clients/eventbridge');
const XRay = require('aws-xray-sdk-core');
const SNS = require('aws-sdk/clients/sns');
const Log = require('@dazn/lambda-powertools-logger');
const wrap = require('@dazn/lambda-powertools-pattern-basic');

const eventBridge = XRay.captureAWSClient(new EventBridge());
const sns = XRay.captureAWSClient(new SNS());

const { BUS_NAME: busName, RESTAURANT_NOTIFICATION_TOPIC: topicArn } =
  process.env;

module.exports.handler = wrap(async event => {
  const order = event.detail;

  const snsRequest = {
    Message: JSON.stringify(order),
    TopicArn: topicArn,
  };

  await sns.publish(snsRequest).promise();

  const { restaurantName, orderId } = order;

  Log.debug('notified restaurant', {
    restaurantName,
    orderId,
  });

  await eventBridge
    .putEvents({
      Entries: [
        {
          Source: 'hungry',
          DetailType: 'restaurant_notified',
          Detail: JSON.stringify(order),
          EventBusName: busName,
        },
      ],
    })
    .promise();

  console.log(`published 'restaurant_notified' event to EventBridge`);

  Log.debug('published event into EventBridge', {
    eventType: 'restaurant_notified',
    eventBusName: busName,
    orderId,
    restaurantName,
  });
});
