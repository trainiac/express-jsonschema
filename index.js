var jsonschema = require('jsonschema'),
    customProperties = {};

function formatValidations(validations) {
    /*
        - Removes excessive validation information
        from jsonschema.
        - Changes validation key names to more intuitive names
        - Consolidations validation messages for the same property
        under one validation object
    */

    var formatted = {};

    Object.keys(validations).forEach(function(requestProperty) {
        var validation = validations[requestProperty],
            propertyValidations = [],
            currentPropertyValidation = {};

        validation.errors.forEach(function(propertyValidation) {
            var isNewProperty = currentPropertyValidation.property !== propertyValidation.property;

            if (isNewProperty) {
                currentPropertyValidation = {
                    value: propertyValidation.instance,
                    property: propertyValidation.property,
                    messages: [propertyValidation.message]
                };
                propertyValidations.push(currentPropertyValidation);
            } else {
                currentPropertyValidation.messages.push(propertyValidation.message);
            }
        });

        formatted[requestProperty] = propertyValidations;
    });

    return formatted;
}

function JsonSchemaCustomPropertyError(propertyName) {
    /*
       This constructor function is invoked when a client
       attempts to add a custom schema property that already
       exists.
    */
    this.message = (
        'express-jsonschema: The schema property "' + propertyName +
        '" already exists. See if it achieves what you need or try ' +
        'giving it another name.'
    );
}

function JsonSchemaValidation(validations) {
    /*
       This constructor function is invoked when the
       `validate` middleware finds invalid data in
       the request.
    */
    this.validations = formatValidations(validations);
    this.message = 'express-jsonschema: Invalid data found';
}

function addSchemaProperties(newProperties) {
    /*
       Updates the private customProperties var with
       the users custom schema properties.
    */
    var validator = new jsonschema.Validator();
    Object.keys(newProperties).forEach(function(attr) {
        if (validator.attributes[attr]) {
            throw new JsonSchemaCustomPropertyError(attr);
        }
        customProperties[attr] = newProperties[attr];
    });
}

function validate(schemas) {
    /*
       Accepts an object where the keys are request properties and the
       values are their respective schemas.

       Returns an express middleware function that validates the given
       request properties when a request is made.  If there is any invalid
       data a `JsonSchemaValidation` instance is thrown.  If the data is
       valid the `next` function is called.
    */
    var validator = new jsonschema.Validator();

    Object.keys(customProperties).forEach(function(attr) {
        validator.attributes[attr] = customProperties[attr];
    });

    return function(req, res, next) {
        var validations = {};
        Object.keys(schemas).forEach(function(requestProperty) {
            var schema = schemas[requestProperty],
                validation;

            validation = validator.validate(
                req[requestProperty],
                schema,
                {propertyName: 'request.' + requestProperty}
            );
            if (!validation.valid) {
                validations[requestProperty] = validation;
            }
        });
        if (Object.keys(validations).length) {
            next(new JsonSchemaValidation(validations));
        } else {
            next();
        }
    };
}

exports = module.exports;
exports.validate = validate;
exports.addSchemaProperties = addSchemaProperties;
exports.JsonSchemaValidation = JsonSchemaValidation;
exports.JsonSchemaCustomPropertyError = JsonSchemaCustomPropertyError;
