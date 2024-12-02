// const { redisClient } = require('../config/redis');
// const commonHelpers = require('../helpers/common.helper');
const { rateLimit } = require('express-rate-limit');

/**
 * Apply rate limit for api calls based on user ip.
 *
 * @param {rule} rule - contains the details to apply rate limit e.g.- {endPoint, rateLimit: {limit, time}}.
 * @param {ip} ip - contains a flag to apply rate limiting on either ip or based on user.
 */
function rateLimiter(rule, ip = true) {
  const { time, limit } = rule;

  return rateLimit({
    windowMs: time * 1000,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests, please try again later.',
    keyGenerator: req => {
      return ip ? req.clientIp : req?.user?.id;
    }
  });
}

module.exports = { rateLimiter };
