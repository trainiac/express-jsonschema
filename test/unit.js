describe('The validate middlewawre', function() {
    it('should call the next middleware on successful validation', function() {
        var helpers = require('./helpers'),
            validate = require('../index'),
            sinon = require('sinon'),
            req = {
                body: helpers.getUser()
            },
            res = {},
            middleware,
            next = sinon.spy();

        middleware = validate('body', helpers.UserSchema);
        middleware(req, res, next);
        next.calledWith();
    });

    it('should throw ValidatorResult with an invalid payload', function() {
        var helpers = require('./helpers'),
            validate = require('../index'),
            ValidatorResult = require('jsonschema').ValidatorResult,
            sinon = require('sinon'),
            req = {
                body: helpers.getUser({id: 'badId'})
            },
            res = {},
            middleware,
            next = function(){};

        middleware = validate('body', helpers.UserSchema);

        (function(){
            middleware(req, res, next);
        }).should.throw(ValidatorResult, {
            errors: [{
              instance: 'badId',
              message: 'is not of a type(s) integer',
              property: 'instance.id',
              schema: { type: 'integer' },
              stack: 'instance.id is not of a type(s) integer'
            }],
            instance: req.body,
            propertyPath: 'instance',
            schema: helpers.UserSchema,
            throwError: undefined
        });

    });

    it('should accept an onValidResult callback and call it when a payload is a valid schema.', function(){
        var helpers = require('./helpers'),
            validate = require('../index'),
            sinon = require('sinon'),
            req = {
                body: helpers.getUser()
            },
            res = {},
            next = sinon.spy(),
            middleware,
            options = {
                onValidResult: function(result, req, res, next, key){
                    req.validated = req[key];
                    req.result = result;
                    req.res = res;
                    next();
                }
            };

        middleware = validate('body', helpers.UserSchema, options);
        middleware(req, res, next);

        req.validated.should.equal(req.body);
        req.result.valid.should.equal(true);
        req.res.should.equal(res);
        next.calledWith();
    });

    it('should accept an onInvalidResult callback and call it when a payload is an invalid schema.', function(){
        var helpers = require('./helpers'),
            validate = require('../index'),
            ValidatorResult = require('jsonschema').ValidatorResult,
            req = {
                body: helpers.getUser({id: 'badId'})
            },
            res = {},
            next = function(){},
            middleware,
            options = {
                onInvalidResult: function(result, req, res, next, key){
                    req.invalidated = req[key];
                    req.res = res;
                    req.theNextFunc = next;
                    throw result;
                }
            };

        middleware = validate('body', helpers.UserSchema, options);

        (function(){
            middleware(req, res, next);
        }).should.throw(ValidatorResult, {
            errors: [{
              instance: 'badId',
              message: 'is not of a type(s) integer',
              property: 'instance.id',
              schema: { type: 'integer' },
              stack: 'instance.id is not of a type(s) integer'
            }],
            instance: req.body,
            propertyPath: 'instance',
            schema: helpers.UserSchema,
            throwError: undefined
        });

        req.invalidated.should.equal(req.body);
        req.res.should.equal(res);
        req.theNextFunc.should.equal(next);
    });

    it('should accept a custom validator instance and use it to validate the payload', function(){
        var helpers = require('./helpers'),
            validate = require('../index'),
            ValidatorResult = require('jsonschema').ValidatorResult,
            Validator = require('jsonschema').Validator,
            assign = require('object-assign'),
            req = {
                body: helpers.getUser({
                    firstName: 'Bob'
                })
            },
            res = {},
            next = function(){},
            middleware,
            options = {},
            validator = new Validator(),
            CustomSchema = assign({}, helpers.UserSchema);


        // setup our custom validator
        validator.attributes.contains = function (instance, schema) {
            if (instance.indexOf(schema.contains) < 0 ){
                return 'does not contain the string '+JSON.stringify(schema.contains);
            }
        };
        options.validator = validator;

        // Add our custom json schema attribute to the schema we will validate against.
        CustomSchema.properties.firstName.contains = 'Todd';

        middleware = validate('body', CustomSchema, options);
        (function(){
            middleware(req, res, next);
        }).should.throw(ValidatorResult, {
            errors: [{
                instance: 'Bob',
                message: 'does not contain the string "Todd"',
                property: 'instance.firstName',
                schema: { contains: 'Todd', type: 'string' },
                stack: 'instance.firstName does not contain the string "Todd"'
            }],
            instance: req.body,
            propertyPath: 'instance',
            schema: CustomSchema,
            throwError: undefined
        });
    });
});
