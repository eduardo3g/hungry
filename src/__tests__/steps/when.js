const EventBridge = require('aws-sdk/clients/eventbridge');

const _ = require('lodash');
const aws4 = require('aws4');
const URL = require('url');
const http = require('axios');

const APP_ROOT = '../../';
const mode = process.env.TEST_MODE;

const viaEventBridge = async (busName, source, detailType, detail) => {
  const eventBridge = new EventBridge();
  await eventBridge
    .putEvents({
      Entries: [
        {
          Source: source,
          DetailType: detailType,
          Detail: JSON.stringify(detail),
          EventBusName: busName,
        },
      ],
    })
    .promise();
};

const viaHandler = async (event, functionName) => {
  const { handler } = require(`${APP_ROOT}/functions/${functionName}`);

  const context = {};
  const response = await handler(event, context);
  const contentType = _.get(
    response,
    'headers.content-type',
    'application/json',
  );

  if (_.get(response, 'body') && contentType === 'application/json') {
    response.body = JSON.parse(response.body);
  }

  return response;
};

const respondFrom = async httpResponse => ({
  statusCode: httpResponse.status,
  body: httpResponse.data,
  headers: httpResponse.headers,
});

const signHttpRequest = url => {
  const urlData = URL.parse(url);
  const options = {
    host: urlData.hostname,
    path: urlData.pathname,
  };

  aws4.sign(options);
  return options.headers;
};

const viaHttp = async (relativePath, method, options) => {
  const url = `${process.env.REST_API_URL}/${relativePath}`;
  console.info(`invoking via HTTP ${method} ${url}`);

  try {
    const data = _.get(options, 'body');
    let headers = {};

    if (_.get(options, 'iam_auth', false) === true) {
      headers = signHttpRequest(url);
    }

    const authHeader = _.get(options, 'auth');
    if (authHeader) {
      headers.Authorization = authHeader;
    }

    const httpReq = http.request({
      method,
      url,
      headers,
      data,
    });

    const res = await httpReq;
    return respondFrom(res);
  } catch (e) {
    if (e.status) {
      return {
        statusCode: e.status,
        headers: e.response.headers,
      };
    }
    throw e;
  }
};

const we_invoke_get_index = async () => {
  switch (mode) {
    case 'handler':
      return await viaHandler({}, 'get-index');
    case 'http':
      return await viaHttp('', 'GET');
    default:
      throw new Error(`unsupported mode: ${mode}`);
  }
};
const we_invoke_get_restaurants = async () => {
  switch (mode) {
    case 'handler':
      return await viaHandler({}, 'get-restaurants');
    case 'http':
      return await viaHttp('restaurants', 'GET', { iam_auth: true });
    default:
      throw new Error(`unsupported mode: ${mode}`);
  }
};

const we_invoke_search_restaurants = async (theme, user) => {
  const body = JSON.stringify({ theme });

  switch (mode) {
    case 'handler':
      return await viaHandler({ body }, 'search-restaurants');
    case 'http':
      return await viaHttp('restaurants/search', 'POST', {
        body,
        auth: user.idToken,
      });
    default:
      throw new Error(`unsupported mode: ${mode}`);
  }
};

const we_invoke_place_order = async (user, restaurantName) => {
  const body = JSON.stringify({ restaurantName });
  const auth = user.idToken;

  switch (mode) {
    case 'handler':
      return await viaHandler({ body }, 'place-order');
    case 'http':
      return await viaHttp('orders', 'POST', { body, auth });
    default:
      throw new Error(`unsupported mode: ${mode}`);
  }
};

const we_invoke_notify_restaurant = async event => {
  if (mode === 'handler') {
    await viaHandler(event, 'notify-restaurant');
  } else {
    const busName = process.env.BUS_NAME;
    await viaEventBridge(
      busName,
      event.source,
      event['detail-type'],
      event.detail,
    );
  }
};

module.exports = {
  we_invoke_get_index,
  we_invoke_get_restaurants,
  we_invoke_search_restaurants,
  we_invoke_place_order,
  we_invoke_notify_restaurant,
};
