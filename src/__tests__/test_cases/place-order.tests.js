const AWS = require('aws-sdk');
const when = require('../steps/when');
const given = require('../steps/given');
const tearDown = require('../steps/teardown');
const { init } = require('../steps/init');

const mockPutEvents = jest.fn();

AWS.EventBridge.prototype.putEvents = mockPutEvents;

describe('Given an authenticated user', () => {
  let user;

  beforeAll(async () => {
    await init();
    user = await given.an_authenticated_user();
  });

  afterAll(async () => {
    await tearDown.an_authenticated_user(user);
  });

  describe('When we invoke the POST /orders endpoint', () => {
    let response;

    beforeAll(async () => {
      mockPutEvents.mockClear();
      mockPutEvents.mockReturnValue({
        promise: async () => {},
      });

      response = await when.we_invoke_place_order(user, 'Fangtasia');
    });

    it('Should return 200', async () => {
      expect(response.statusCode).toEqual(200);
    });

    it('Should publish a message to EventBridge bus', async () => {
      expect(mockPutEvents).toBeCalledWith({
        Entries: [
          expect.objectContaining({
            Source: 'hungry',
            DetailType: 'order_placed',
            Detail: expect.stringContaining(`"restaurantName":"Fangtasia"`),
            EventBusName: expect.stringMatching(process.env.BUS_NAME),
          }),
        ],
      });
    });
  });
});
