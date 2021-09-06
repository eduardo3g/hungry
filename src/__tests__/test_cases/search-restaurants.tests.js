const { init } = require('../steps/init');
const when = require('../steps/when');

console.log = jest.fn();

describe(`When we invoke the POST /restaurants/search endpoint with theme 'cartoon'`, () => {
  beforeAll(async () => await init());

  it(`Should return an array of 4 restaurants`, async () => {
    let res = await when.we_invoke_search_restaurants('cartoon');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveLength(4);

    for (let restaurant of res.body) {
      expect(restaurant).toHaveProperty('name');
      expect(restaurant).toHaveProperty('image');
    }
  });
});
