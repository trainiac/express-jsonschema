/**
    @module express-jsonschema
    @author Adrian Adkison
 */


var jsonschema = require('jsonschema'),
    customProperties = {};


/**
   @function formatValidations

   @desc Formats the validation data structure from the jsonschema
         library into a more convenient data structure.

   @private

   @param {Object} validations - An object where the keys are request
          properties and the values are their respective jsonschema
          validations.

   @returns {Object} formatted - An object where the keys are request
            properties and the values are their respective formatted
            validations.
*/

function formatValidations(validations) {
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


/**
   @constructor JsonSchemaCustomPropertyError

   @desc Instantiated when a client attempts to add a custom schema property
      that already exists.

   @public

   @param {String} propertyName - The name of the schema property that has a conflict.
*/

function JsonSchemaCustomPropertyError(propertyName) {
    /** @member {String} name */
    this.name = 'JsonSchemaCustomPropertyError';

    /** @member {String} message */
    this.message = (
        'express-jsonschema: The schema property "' + propertyName +
        '" already exists. See if it achieves what you need or try ' +
        'giving it another name.'
    );
}


/**
   @constructor JsonSchemaValidation

   @desc Instantiated when invalid data is found in the request.

   @public

   @param {Object} validations - An object where the keys are request
          properties and the values are their respective jsonschema
          validations.
*/

function JsonSchemaValidation(validations) {
    /** @member {String} name */
    this.name = 'JsonSchemaValidation';

    /** @member {String} message */
    this.message = 'express-jsonschema: Invalid data found';

    /** @member {Object} validations */
    this.validations = formatValidations(validations);
}


/**
   @function addSchemaProperties

   @desc Updates customProperties with
       the newProperties param.  Provides a way for client
       to extend JSON Schema validations.

   @public

   @param {Object} newProperties - An object where the keys are the
          names of the new schema properties and the values are the respective
          functions that implement the validation.

   @throws {JsonSchemaCustomPropertyError} Client tries to override
           an existing JSON Schema property.
*/

function addSchemaProperties(newProperties) {
    var validator = new jsonschema.Validator();
    Object.keys(newProperties).forEach(function(attr) {
        if (validator.attributes[attr]) {
            throw new JsonSchemaCustomPropertyError(attr);
        }
        customProperties[attr] = newProperties[attr];
    });
}


/**
   @function validate

   @desc Accepts an object where the keys are request properties and the
         values are their respective schemas.  Optionally, you may provide
         dependency schemas that are referenced by your schemas using `$ref`
         (see https://www.npmjs.com/package/jsonschema#complex-example-with-split-schemas-and-references
         for more details).

         Returns a middleware function that validates the given
         request properties when a request is made.  If there is any invalid
         data a JsonSchemaValidation instance is passed to the next middleware.
         If the data is valid the next middleware is called with no params.

   @public

   @param {Object} schemas - An object where the keys are request properties
          and the values are their respective schemas.

   @param {Array<Object>} [schemaDependencies] - A list of schemas on which
          schemas in `schemas` parameter are dependent.  These will be added
          to the `jsonschema` validator.

   @returns {callback} - A middleware function.
*/

function validate(schemas, schemaDependencies) {
    var validator = new jsonschema.Validator();

    if (Array.isArray(schemaDependencies)) {
        schemaDependencies.forEach(function(dependency){
            validator.addSchema(dependency);
        });
    }

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
