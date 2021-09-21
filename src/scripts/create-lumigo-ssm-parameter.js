const AWS = require('aws-sdk');

AWS.config.update({ region: 'eu-west-1' });
const SSM = new AWS.SSM({ apiVersion: '2014-11-06' });

(async () => {
  try {
    const args = process.argv.slice(2);

    if (args.length < 1 || args.length > 1)
      throw new Error(
        `You provided ${args.length} ${
          args.length < 1 ? 'no arguments' : 'arguments'
        }, make sure to provide only 1 (e.g: 'token=my-secret-token')`,
      );

    const argumentName = args[0].split('=')[0];

    if (argumentName !== 'token')
      throw new Error(
        `Only the argument 'token' is expected, but you provided '${argumentName}'`,
      );

    const lumigoToken = args[0].split('=')[1];

    if (!lumigoToken)
      throw new Error(
        `You must provide a 'token' argument via Node.js CLI (e.g: 'node create-lumigo-ssm-parameter token=my-secret-token')`,
      );

    const lumigoTokenName = '/lumigo/tracing-token';

    const params = {
      Name: lumigoTokenName,
      Value: String(lumigoToken),
      Type: 'String',
      Overwrite: true, // avoid erroring during the CI flow if the parameter was already created before
      Description:
        'Token used by Lumigo (lumigo.io) to capture distributed tracing from the AWS Platform.',
    };
    await SSM.putParameter(params).promise();

    console.log(
      `Successfully created/updated a SSM Parameter named [${lumigoTokenName}]: `,
    );
  } catch (err) {
    console.error('Failed to create SSM Parameter: ', {
      errorMessage: err.message,
      errStack: err.stack,
    });
  }
})();
