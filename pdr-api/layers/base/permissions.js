const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const INVALID_TOKEN = {
  decoded: false,
  data: null
};
const { Exception, logger } = require('./base');

async function decodeJWT(event, issuer, jwksUri) {
  const token = event.headers.Authorization;

  let decoded = null;
  try {
    decoded = await new Promise(function (resolve) {
      verifyToken(
        token,
        issuer,
        jwksUri,
        function (data) {
          logger.debug('Data:', data);
          resolve(data);
        },
        function (err) {
          logger.debug('error:', err);
          resolve(false);
        }
      );
    }).catch(e => {
      logger.debug('e verify:', e);
      return INVALID_TOKEN;
    });
    logger.debug('token:', decoded);
    if (decoded === false) {
      logger.debug('403');
      return INVALID_TOKEN;
    } else {
      // They are good.
      return {
        decoded: true,
        data: decoded
      };
    }
  } catch (e) {
    logger.error('err p:', e);
    return INVALID_TOKEN;
  }
};

function verifyToken(token, issuer, jwksUri, callback, sendError) {
  logger.debug('verifying token');
  logger.debug('token:', token);

  // validate the 'Authorization' header. it should have the following format: `Bearer tokenString`
  if (token && token.indexOf('Bearer ') == 0) {
    let tokenString = token.split(' ')[1];

    logger.debug('Remote JWT verification');

    // Get the SSO_JWKSURI and process accordingly.
    const client = jwksClient({
      strictSsl: true, // Default value
      jwksUri: jwksUri
    });

    const kid = jwt.decode(tokenString, { complete: true }).header.kid;

    client.getSigningKey(kid, (err, key) => {
      if (err) {
        logger.debug('Signing Key Error:', err);
        callback(sendError());
      } else {
        const signingKey = key.publicKey || key.rsaPublicKey;
        verifySecret(tokenString, issuer, signingKey, callback, sendError);
      }
    });
  } else {
    logger.debug("Token didn't have a bearer.");
    return callback(sendError());
  }
};

function verifySecret(tokenString, issuer, secret, callback, sendError) {
  jwt.verify(tokenString, secret, function (verificationError, decodedToken) {
    // check if the JWT was verified correctly
    if (verificationError == null && decodedToken && decodedToken.resource_access['data-register'].roles) {
      logger.debug('JWT decoded');

      logger.debug('decoded token:', decodedToken);

      logger.debug('decodedToken.iss', decodedToken.iss);
      logger.debug('decodedToken roles', decodedToken.resource_access['data-register'].roles);

      logger.debug('SSO_ISSUER', issuer);

      // check if the dissuer matches
      let issuerMatch = decodedToken.iss == issuer;

      logger.debug('issuerMatch', issuerMatch);

      if (issuerMatch) {
        logger.debug('JWT Verified');
        return callback(decodedToken);
      } else {
        logger.debug('JWT Role/Issuer mismatch');
        return callback(sendError());
      }
    } else {
      // return the error in the callback if the JWT was not verified
      logger.debug('JWT Verification Error:', verificationError);
      return callback(sendError());
    }
  });
}

async function roleFilter(records, roles) {
  return new Promise(resolve => {
    const data = records.filter(record => {
      logger.debug('record:', record.roles);
      // Sanity check if `roles` isn't defined on reacord. Default to readable.
      if (record?.roles?.length > 0) {
        return roles.some(role => record.roles.indexOf(role) != -1);
      } else {
        return false;
      }
    });
    resolve(data);
  });
}
exports.roleFilter = roleFilter;

function resolvePermissions(token) {
  let roles = ['public'];
  let isAdmin = false;
  let isAuthenticated = false;

  try {
    logger.debug(JSON.stringify(token.data));
    roles = token.data.resource_access['data-register'].roles;
    // If we get here, they have authenticated and have some roles in the data-register client.  Treat them as
    // an admin of some sort
    isAuthenticated = true;

    logger.debug(JSON.stringify(roles));
    if (roles.includes('sysadmin')) {
      logger.debug('ISADMIN');
      isAdmin = true;
    }
  } catch (e) {
    // Fall through, assume public.
    logger.debug(e);
  }

  return {
    roles: roles,
    isAdmin: isAdmin,
    isAuthenticated: isAuthenticated,
    email: token.data.email
  };
};

/**
 * Checks if the user invoking the function is an admin.
 * @param {Object} lambdaEvent - The Lambda event object.
 * @returns {boolean} Returns true if the user is an admin, otherwise throws an error.
 * @throws {Error} Throws an error with details if the user is not an admin.
 */
function requireAdmin(lambdaEvent) {
  const isAdmin = JSON.parse(lambdaEvent?.requestContext?.authorizer?.isAdmin);
  if (!isAdmin) {
    throw new Exception('User does not have the permissions to perform this action.', {
      code: 403,
      error: 'Unauthorized to perform this function.'
    });
  }
  return true;
}


module.exports = {
  decodeJWT,
  requireAdmin,
  resolvePermissions
};
