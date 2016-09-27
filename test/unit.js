/* jshint mocha: true */
var sinon = require('sinon');

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

describe('using one schema dependency when validating a valid object', function() {
    it('should validate the object with schema dependency', function() {
        var next = sinon.spy(),
            AddressSchema = {
                "id": "/Address",
                "type": "object",
                "properties": {
                    "city": {"type": "string"},
                    "state": {"type": "string"},
                    "country": {"type": "string"}
                }
            },
            PersonSchema = {
                "id": "/Person",
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "address": {"$ref": "/Address"}
                }
            },
            request = {
                "post": {
                    "name": "Adrian",
                    "address" : {
                        "city": "Oakland",
                        "state": "CA",
                        "country": "USA"
                    }
                }
            },
            validate = require('../index.js').validate,
            validateRequest = validate({post: PersonSchema}, [AddressSchema]);

        validateRequest(request, function(){}, next);
        next.calledWith().should.be.eql(true);
    });
});

describe('using two schema dependencies when validating a valid object', function() {
    it('should validate the object with schema dependency', function() {
        var next = sinon.spy(),
            AddressSchema = {
                "id": "/Address",
                "type": "object",
                "properties": {
                    "city": {"type": "string"},
                    "state": {"type": "string"},
                    "country": {"type": "string"},
                    "street": {"$ref": "/Street"}
                }
            },
            StreetSchema = {
                "id": "/Street",
                "type": "object",
                "properties": {
                    "number": {"type": "string"},
                    "name": {"type": "string"}
                }
            },
            PersonSchema = {
                "id": "/Person",
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "address": {"$ref": "/Address"}
                }
            },
            request = {
                "post": {
                    "name": "Adrian",
                    "address" : {
                        "city": "Oakland",
                        "state": "CA",
                        "country": "USA",
                        "street": {
                            "name": "Broadway St",
                            "number": 555
                        }
                    }
                }
            },
            validate = require('../index.js').validate,
            validateRequest = validate({post: PersonSchema}, [AddressSchema, StreetSchema]);

        validateRequest(request, function(){}, next);
        next.calledWith().should.be.eql(true);
    });
});