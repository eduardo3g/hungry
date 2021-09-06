const _ = require('lodash');

const APP_ROOT = '../../';

const viaHandler = async (event, functionName) => {
  const { handler } = require(`${APP_ROOT}/functions/${functionName}`);

  const context = {};
  const response = await handler(event, context);
  const contentType = _.get(
    response,
    'headers.Content-Type',
    'application/json',
  );

  if (response.body && contentType === 'application/json') {
    response.body = JSON.parse(response.body);
  }

  return response;
};

const we_invoke_get_index = () => viaHandler({}, 'get-index');

module.exports = {
  we_invoke_get_index,
};
