const AWS = require('aws-sdk');
const chance = require('chance').Chance();

const { init } = require('../steps/init');
const when = require('../steps/when');

console.log = jest.fn();

const mockPutEvents = jest.fn();
AWS.EventBridge.prototype.putEvents = mockPutEvents;
const mockPublish = jest.fn();
AWS.SNS.prototype.publish = mockPublish;

describe('When we invoke the notify-restaurant function', () => {
  if (process.env.TEST_MODE === 'handler') {
    beforeAll(async () => {
      await init();

      mockPutEvents.mockClear();
      mockPublish.mockClear();

      mockPutEvents.mockReturnValue({
        promise: async () => {},
      });
      mockPublish.mockReturnValue({
        promise: async () => {},
      });

      const event = {
        source: 'hungry',
        'detail-type': 'order_placed',
        detail: {
          orderId: chance.guid(),
          userEmail: chance.email(),
          restaurantName: 'Fangtasia',
        },
      };
      await when.we_invoke_notify_restaurant(event);
    });

    it('Should publish message to SNS', async () => {
      expect(mockPublish).toBeCalledWith({
        Message: expect.stringMatching(`"restaurantName":"Fangtasia"`),
        TopicArn: expect.stringMatching(
          process.env.RESTAURANT_NOTIFICATION_TOPIC,
        ),
      });
    });

    it('Should publish event to EventBridge', async () => {
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
    it('no acceptance test', () => {});
  }
});
