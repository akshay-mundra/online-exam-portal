const { redisClient } = require('../config/redis');
const commonHelpers = require('../helpers/common.helper');

/**
 * Apply rate limit for api calls based on user ip.
 *
 * @param {rule} rule - contains the details to apply rate limit e.g.- {endPoint, rateLimit: {limit, time}}.
 */
function rateLimiter(rule) {
  const { endPoint, rateLimit } = rule;
  return async (req, res, next) => {
    try {
      const ip = req.ip;
      const key = `${endPoint}:${ip}`;

      const requests = await redisClient.incr(key);

      if (requests === 1) {
        await redisClient.expire(key, rateLimit.time);
      }

      if (requests > rateLimit.limit) {
        return commonHelpers.throwCustomError('Too many requests', 429);
      }

      next();
    } catch (error) {
      commonHelpers.errorHandler(req, res, error.message, error.statusCode);
    }
  };
}

module.exports = { rateLimiter };
