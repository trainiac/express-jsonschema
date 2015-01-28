describe('The validate middlewawre', function() {
    it('should call the next middleware on successful validation', function() {
        var helpers = require('./helpers'),
            validateReq = require('../index').validateReq,
            sinon = require('sinon'),
            req = {
                body: helpers.getUser()
            },
            res = {},
            middleware,
            next = sinon.spy();

        middleware = validateReq('body', helpers.UserSchema);
        middleware(req, res, next);
        next.calledWith();
    });

    it('should throw ValidatorResult with an invalid payload', function() {
        var helpers = require('./helpers'),
            validateReq = require('../index').validateReq,
            ValidatorResult = require('../index').ValidatorResult,
            sinon = require('sinon'),
            req = {
                body: helpers.getUser({id: 'badId'})
            },
            res = {},
            middleware,
            next = function(){};

        middleware = validateReq('body', helpers.UserSchema);

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

    it('should accept an ifInvalid callback and call it when a payload is an invalid schema.', function(){
        var helpers = require('./helpers'),
            validateReq = require('../index').validateReq,
            ValidatorResult = require('../index').ValidatorResult,
            req = {
                body: helpers.getUser({id: 'badId'})
            },
            res = {},
            next = function(){},
            middleware,
            options = {
                ifInvalid: function(result, req, res, next){
                    req.res = res;
                    req.theNextFunc = next;
                    throw result;
                }
            };

        middleware = validateReq('body', helpers.UserSchema, options);

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

        req.res.should.equal(res);
        req.theNextFunc.should.equal(next);
    });

    it('should accept a custom validator instance and use it to validate the payload', function(){
        var helpers = require('./helpers'),
            validateReq = require('../index').validateReq,
            ValidatorResult = require('../index').ValidatorResult,
            Validator = require('../index').Validator,
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

        middleware = validateReq('body', CustomSchema, options);
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
