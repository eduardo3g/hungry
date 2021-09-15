const AWS = require('aws-sdk');
const chance = require('chance').Chance();

const { init } = require('../steps/init');
const when = require('../steps/when');
const messages = require('../messages');

const mockPutEvents = jest.fn();
const mockPublish = jest.fn();

describe(`When we invoke the notify-restaurant function`, () => {
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

    if (process.env.TEST_MODE === 'handler') {
      AWS.EventBridge.prototype.putEvents = mockPutEvents;
      AWS.SNS.prototype.publish = mockPublish;

      mockPutEvents.mockReturnValue({
        promise: async () => {},
      });
      mockPublish.mockReturnValue({
        promise: async () => {},
      });
    } else {
      messages.startListening();
    }

    await when.we_invoke_notify_restaurant(event);
  });

  afterAll(() => {
    if (process.env.TEST_MODE === 'handler') {
      mockPutEvents.mockClear();
      mockPublish.mockClear();
    }
  });

  if (process.env.TEST_MODE === 'handler') {
    it(`Should publish message to SNS`, async () => {
      expect(mockPublish).toBeCalledWith({
        Message: expect.stringMatching(`"restaurantName":"Fangtasia"`),
        TopicArn: expect.stringMatching(
          process.env.RESTAURANT_NOTIFICATION_TOPIC,
        ),
      });
    });

    it(`Should publish event to EventBridge`, async () => {
      expect(mockPutEvents).toBeCalledWith({
        Entries: [
          expect.objectContaining({
            Source: 'hungry',
            DetailType: 'restaurant_notified',
            Detail: expect.stringContaining(`"restaurantName":"Fangtasia"`),
            EventBusName: expect.stringMatching(process.env.BUS_NAME),
          }),
        ],
      });
    });
  } else {
    it(`Should publish message to SNS`, async () => {
      await messages.waitForMessage(
        'sns',
        process.env.RESTAURANT_NOTIFICATION_TOPIC,
        JSON.stringify(event.detail),
      );
    }, 10000);
  }
});
