var assign = require('object-assign'),
    jsonschema = require('jsonschema'),
    defaults = {
        // middleware specific options
        ifInvalid: function(result, req, res, next){
            throw result;
        }
    };

exports = module.exports;
exports.Validator = jsonschema.Validator;
exports.ValidatorResult = jsonschema.ValidatorResult;
exports.ValidationError = jsonschema.ValidationError;
exports.SchemaError = jsonschema.SchemaError;
exports.validate = jsonschema.validate;

exports.validateReq = function(property, schema, options) {
    var settings,
        validator;

    options = options || {};
    settings = assign({}, defaults, options);

    // if a validator instance is passed into the middleware
    // function use that over the default
    validator = options.validator || jsonschema;
    return function(req, res, next) {
        var result = validator.validate(req[property], schema, options);
        if (result.valid) {
            next();
        } else {
            settings.ifInvalid(result, req, res, next);
        }
    };
};
