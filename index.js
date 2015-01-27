var assign = require('object-assign'),
    Validator = require('jsonschema').Validator,
    defaults = {
        // middleware specific options
        onInvalidResult: function(result, req, res, next, key){
            throw result;
        },
        onValidResult: function(result, req, res, next, key){
            next();
        }
    };

module.exports = function(key, schema, options) {
    var settings,
        v;

    options = options || {};
    settings = assign({}, defaults, options);

    // if the a validator instance is passed into the middleware
    // function use that over the default
    v = options.validator || new Validator();
    return function(req, res, next) {
        var result = v.validate(req[key], schema, options);
        if (result.valid) {
            settings.onValidResult(result, req, res, next, key);
        } else {
            settings.onInvalidResult(result, req, res, next, key);
        }
    };
};
