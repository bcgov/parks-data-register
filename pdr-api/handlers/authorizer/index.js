const { decodeJWT, resolvePermissions } = require('/opt/permissions');
const { logger } = require('/opt/base');

const publicPermissionObject = {
  isAdmin: false,
  role: ['public']
};

exports.handler = async function (event, context, callback) {
  logger.debug('event', JSON.stringify(event));

  if (!event.headers.Authorization) {
    logger.debug('No authorization header provided.');
    return 'No authorization header provided.';
  }

  if (event.headers.Authorization === 'None') {
    // Public user.
    return generatePolicy('public', 'Allow', event.methodArn, publicPermissionObject);
  }

  let token = await decodeJWT(event);
  logger.debug('token', JSON.stringify(token));

  if (!token.decoded) {
    logger.debug('Issue decoding token.');
    return 'Error: Invalid token';
  }

  const permissionObject = resolvePermissions(token);
  logger.debug('permissionObject', JSON.stringify(permissionObject));
  if (!permissionObject.isAuthenticated) {
    logger.debug('User is not authenticated.');
    return 'Unauthorized';
  }

  // Sysadmin
  logger.debug('User authenticated.');
  return generatePolicy(token.data.sid, 'Allow', event.methodArn, permissionObject);
};

// Help function to generate an IAM policy
let generatePolicy = function (principalId, effect, methodArn, permissionObject) {
  logger.debug('principalId', principalId);
  let authResponse = {};

  authResponse.principalId = principalId;
  if (effect && methodArn) {
    let policyDocument = {};
    policyDocument.Version = '2012-10-17';
    policyDocument.Statement = [];
    let statementOne = {};
    statementOne.Action = 'execute-api:Invoke';
    statementOne.Effect = effect;
    statementOne.Resource = methodArn;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }

  // Optional output with custom properties of the String, Number or Boolean type.
  authResponse.context = {
    isAdmin: permissionObject?.isAdmin,
    role: JSON.stringify(permissionObject?.roles)
  };
  logger.debug('authResponse', JSON.stringify(authResponse));
  return authResponse;
};
