const when = require('../steps/when');
const given = require('../steps/given');
const tearDown = require('../steps/teardown');
const { init } = require('../steps/init');
const messages = require('../messages');

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
      messages.startListening();
      response = await when.we_invoke_place_order(user, 'Fangtasia');
    });

    it('Should return 200', async () => {
      expect(response.statusCode).toEqual(200);
    });

    it('Should publish a message to EventBridge bus', async () => {
      const { orderId } = response.body;

      await messages.waitForMessage(
        'eventbridge',
        process.env.BUS_NAME,
        JSON.stringify({
          source: 'hungry',
          'detail-type': 'order_placed',
          detail: {
            orderId,
            restaurantName: 'Fangtasia',
          },
        }),
      );
    }, 10000);
  });
});
