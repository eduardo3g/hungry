const AWS = require('aws-sdk');
const chance = require('chance').Chance();

const random_password = () => `${chance.string({ length: 8 })}!1Hungry`;

const an_authenticated_user = async () => {
  const cognito = new AWS.CognitoIdentityServiceProvider();

  const userpoolId = process.env.COGNITO_USER_POOL_ID;
  const clientId = process.env.COGNITO_SERVER_CLIENT_ID;

  const firstName = chance.first({ nationality: 'en' });
  const lastName = chance.last({ nationality: 'en' });
  const suffix = chance.string({
    length: 8,
    pool: 'abcdefghijklmnopqrstuvwxyz',
  });
  const username = `test-${firstName}-${lastName}-${suffix}`;
  const password = random_password();
  const email = `${firstName}-${lastName}@hungry.com`;

  const createRequest = {
    UserPoolId: userpoolId,
    Username: username,
    MessageAction: 'SUPPRESS',
    TemporaryPassword: password,
    UserAttributes: [
      { Name: 'given_name', Value: firstName },
      { Name: 'family_name', Value: lastName },
      { Name: 'email', Value: email },
    ],
  };

  await cognito.adminCreateUser(createRequest).promise();

  console.log(`[${username}] - user is created`);

  const request = {
    AuthFlow: 'ADMIN_NO_SRP_AUTH',
    UserPoolId: userpoolId,
    ClientId: clientId,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  };

  const response = await cognito.adminInitiateAuth(request).promise();

  console.log('initiate auth response', response);

  console.log(`[${username}] - initialised auth flow`);

  const challengeRequest = {
    UserPoolId: userpoolId,
    ClientId: clientId,
    ChallengeName: response.ChallengeName,
    Session: response.Session,
    ChallengeResponses: {
      USERNAME: username,
      NEW_PASSWORD: random_password(),
    },
  };

  const challengeResponse = await cognito
    .adminRespondToAuthChallenge(challengeRequest)
    .promise();

  console.log(`[${username}] - responded to auth challenge`);

  return {
    username,
    firstName,
    lastName,
    idToken: challengeResponse.AuthenticationResult.IdToken,
  };
};

module.exports = {
  an_authenticated_user,
};
