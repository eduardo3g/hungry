const chance = require('chance').Chance();

const { init } = require('../steps/init');
const when = require('../steps/when');
const messages = require('../messages');

console.log = jest.fn();

describe('When we invoke the notify-restaurant function', () => {
  const event = {
    source: 'hungry',
    'detail-type': 'order_placed',
    detail: {
      orderId: chance.guid(),
      restaurantName: 'Fangtasia',
    },
  };

  beforeAll(async () => {
    await init();
    messages.startListening();
    await when.we_invoke_notify_restaurant(event);
  });

  it(`Should publish message to SNS`, async () => {
    await messages.waitForMessage(
      'sns',
      process.env.RESTAURANT_NOTIFICATION_TOPIC,
      JSON.stringify(event.detail),
    );
  }, 10000);

  it('Should publish "restaurant_notified" event to EventBridge', async () => {
    await messages.waitForMessage(
      'eventbridge',
      process.env.BUS_NAME,
      JSON.stringify({
        ...event,
        'detail-type': 'restaurant_notified',
      }),
    );
  }, 10000);
});
