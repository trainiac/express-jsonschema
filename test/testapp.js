var express = require('express'),
    bodyParser = require('body-parser'),
    helpers = require('./helpers'),
    validate = require('../index.js').validate,
    SchemaError = require('jsonschema'),
    addSchemaProperties = require('../index.js').addSchemaProperties,
    app = express();

function clearBody(req, res, next) {
    delete req.body;
    next();
}

app.use(bodyParser.json());

addSchemaProperties({
    contains: function validateContains(instance, schema) {
        if (typeof instance !== 'string') {
            return;
        }
        if (typeof schema.contains !== 'string') {
            throw new SchemaError('"contains" expects a string', schema);
        }
        if (instance.indexOf(schema.contains) < 0) {
            return 'does not contain the string ' + JSON.stringify(schema.contains);
        }
    }
});

/********** Set up test routes  ********/

app.post('/user/', validate({body: helpers.getUserSchema()}), function(req, res) {
    res.json({
        id: '1234'
    });
});

app.post(
    '/api/user/',
    validate({
        body: helpers.getUserSchema(),
        query: helpers.getTokenSchema()
    }),
    function(req, res) {
        res.json({
            id: '1235'
        });
    }
);

app.post(
    '/user/empty_body/',
    clearBody,
    validate({body: helpers.getUserSchema()}),
    function(req, res) {
        res.json({
            id: '1236'
        });
    }
);

app.post(
    '/user/create_default',
    clearBody,
    validate({
        body: helpers.getUserSchema({
            required: false
        })
    }),
    function(req, res) {
        res.json({
            id: '1237'
        });
    }
);

app.post(
    '/user/split_schema/',
    validate({
        body: helpers.getUserSchema({
            properties: {
                address: {'$ref': '/AddressSchema'}
            }
        })
    }, [helpers.getAddressSchema()]),
    function(req, res) {
        res.json({
            id: '1337'
        });
    }
);

/****** Setup validation handler **************/

app.use(function(err, req, res, next) {
    if (err.name === 'JsonSchemaValidation') {
        res.status(400);
        res.json({
            statusText: 'Bad Request',
            validations: err.validations
        });
    } else {
        next(err);
    }
});

module.exports = app;
