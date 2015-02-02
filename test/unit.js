/* jshint mocha: true */

describe('addSchemaProperties', function() {
    it('should raise a JsonSchemaCustomPropertyError if you try to add ' +
        'a schema property that already exists', function() {
        var addSchemaProperties = require('../index.js').addSchemaProperties,
            JsonSchemaCustomPropertyError = require('../index.js').JsonSchemaCustomPropertyError;

        function attempt() {
            addSchemaProperties({minLength: function() {}});
        }
        attempt.should.throw(JsonSchemaCustomPropertyError, {
            message: (
                'express-jsonschema: The schema property "minLength"' +
                ' already exists. See if it achieves what you need or try ' +
                'giving it another name.'
            )
        });
    });
});
