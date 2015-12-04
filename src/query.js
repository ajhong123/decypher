/**
 * Decypher Query Builder
 * =======================
 *
 * Simple cypher query builder.
 */
var assign = require('lodash.assign'),
    isPlainObject = require('lodash.isplainobject');

var STATEMENTS = require('./syntax.js').STATEMENTS;

/**
 * Helpers.
 */
function capitalize(string) {
  return string.charAt(0).toUpperCase(string) + string.slice(1);
}

/**
 * Class.
 */
function Query() {

  // Properties
  this._statements = [];
  this._params = {};
}

// Retrieving statements
Query.prototype.statements = function() {
  return this._statements.slice(0);
};

// Compiling the query
Query.prototype.compile = function() {
  return this._statements.join('\n') + ';';
};
Query.prototype.toString = Query.prototype.compile;

// Retrieving the query's parameters
Query.prototype.params = function(params) {
  if (!params)
    return this._params;

  if (!isPlainObject(params))
    throw Error('decypher.Query.params: passed parameters should be a plain object.');

  assign(this._params, params);
  return this;
};

// Building the query
Query.prototype.build = function() {
  return {
    query: this.compile(),
    params: this.params(),
    statements: this.statements()
  };
};

// Attaching a method to the prototype for each statement
STATEMENTS.concat(['']).forEach(function(statement) {
  var tokens = statement
    .toLowerCase()
    .split(' ');

  var methodName = statement ?
    tokens[0] + tokens.slice(1).map(capitalize).join('') :
    'add';

  Query.prototype[methodName] = function(parts, params) {
    if (params && !isPlainObject(params))
      throw Error('decypher.Query.add: second parameter should be a plain object.');

    parts = [].concat(parts);

    var valid = parts.every(function(part) {
      return typeof part === 'string';
    });

    if (!valid)
      throw Error('decypher.Query.' + methodName + ': first parameter should be a string.');

    var string = '';

    if (statement)
      string += statement + ' ';

    string += parts.join(', ');

    this._statements.push(string);

    assign(this._params, params);

    return this;
  };
});

module.exports = Query;