const EventBridge = require('aws-sdk/clients/eventbridge');
const SNS = require('aws-sdk/clients/sns');

const eventBridge = new EventBridge();
const sns = new SNS();

const { BUS_NAME: busName, RESTAURANT_NOTIFICATION_TOPIC: topicArn } =
  process.env;

module.exports.handler = async event => {
  const order = event.detail;

  const snsRequest = {
    Message: JSON.stringify(order),
    TopicArn: topicArn,
  };

  await sns.publish(snsRequest).promise();

  const { restaurantName, orderId } = order;
  console.log(`notified restaurant [${restaurantName}] of order [${orderId}]`);

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
};
