
/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

/**
 * Used to configure the graphQLHTTP middleware by providing a schema
 * and other configuration options.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = graphqlHTTP;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _httpErrors = require('http-errors');

var _httpErrors2 = _interopRequireDefault(_httpErrors);

var _graphql = require('graphql');

var _graphqlError = require('graphql/error');

var _parseBody = require('./parseBody');

/**
 * Middleware for express; takes an options object or function as input to
 * configure behavior, and returns an express middleware.
 */

function graphqlHTTP(options) {
  if (!options) {
    throw new Error('GraphQL middleware requires options.');
  }

  return regeneratorRuntime.mark(function graphqlHTTPMiddleware(next) {
    var request, response, _getOptions,

    // Get GraphQL options given this request.
    schema, rootValue, pretty;

    return regeneratorRuntime.wrap(function graphqlHTTPMiddleware$(context$2$0) {
      var _this = this;

      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          request = this.request;
          response = this.response;
          _getOptions = getOptions(options, request);
          schema = _getOptions.schema;
          rootValue = _getOptions.rootValue;
          pretty = _getOptions.pretty;
          context$2$0.next = 8;
          return new Promise(function (resolve, reject) {

            // GraphQL HTTP only supports GET and POST methods.
            if (request.method !== 'GET' && request.method !== 'POST') {
              _this.set('Allow', 'GET, POST');
              return sendError(response, (0, _httpErrors2['default'])(405, 'GraphQL only supports GET and POST requests.'), pretty);
            }

            // Parse the Request body.
            (0, _parseBody.parseBody)(request, function (error) {
              var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

              // Format any request errors the same as GraphQL errors.
              if (error) {
                return sendError(response, error, pretty);
              }

              // Get GraphQL params from the request and POST body data.

              var _getGraphQLParams = getGraphQLParams(request, data);

              var query = _getGraphQLParams.query;
              var variables = _getGraphQLParams.variables;
              var operationName = _getGraphQLParams.operationName;

              // Run GraphQL query.
              (0, _graphql.graphql)(schema, query, rootValue, variables, operationName).then(function (result) {
                // Format any encountered errors.
                if (result.errors) {
                  result.errors = result.errors.map(_graphqlError.formatError);
                }

                // Report 200:Success if a data key exists,
                // Otherwise 400:BadRequest if only errors exist.
                _this.set('Content-Type', 'text/json');
                _this.status = result.hasOwnProperty('data') ? 200 : 400;
                resolve(JSON.stringify(result, null, pretty ? 2 : 0));
              });
            });
          });

        case 8:
          this.body = context$2$0.sent;

        case 9:
        case 'end':
          return context$2$0.stop();
      }
    }, graphqlHTTPMiddleware, this);
  });
}

/**
 * Get the options that the middleware was configured with, sanity
 * checking them.
 */
function getOptions(options, request) {
  var optionsData = typeof options === 'function' ? options(request) : options;

  if (!optionsData || typeof optionsData !== 'object') {
    throw new Error('GraphQL middleware option function must return an options object.');
  }

  if (!optionsData.schema) {
    throw new Error('GraphQL middleware options must contain a schema.');
  }

  return optionsData;
}

/**
 * Helper function to get the GraphQL params from the request.
 */
function getGraphQLParams(request, data) {
  // GraphQL Query string.
  var query = request.query.query || data.query;
  if (!query) {
    throw (0, _httpErrors2['default'])(400, 'Must provide query string.');
  }

  // Parse the variables if needed.
  var variables = request.query.variables || data.variables;
  if (variables && typeof variables === 'string') {
    try {
      variables = JSON.parse(variables);
    } catch (error) {
      throw (0, _httpErrors2['default'])(400, 'Variables are invalid JSON.');
    }
  }

  // Name of GraphQL operation to execute.
  var operationName = request.query.operationName || data.operationName;

  return { query: query, variables: variables, operationName: operationName };
}

/**
 * Helper for formatting errors
 */
function sendError(response, error, pretty) {
  var errorResponse = { errors: [(0, _graphqlError.formatError)(error)] };
  response.status = error.status || 500;
  response.set('Content-Type', 'text/json');
  response.body = JSON.stringify(errorResponse, null, pretty ? 2 : 0);
}
module.exports = exports['default'];

/**
 * A GraphQL schema from graphql-js.
 */

/**
 * An object to pass as the rootValue to the graphql() function.
 */

/**
 * A boolean to configure whether the output should be pretty-printed.
 */