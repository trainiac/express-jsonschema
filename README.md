# express-jsonschema

[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]

[express.js]( https://github.com/visionmedia/express ) middleware for JSON schema validation.

This library can be easily integrated into an `express` applicaton to validate API payloads (e.g. `request.params`, `request.query`, `request.body`, etc.) against a [JSON schema]( http://json-schema.org/ ).

## Why validate with JSON schemas?

- **Simple** - JSON schemas are a simple and expressive way to describe a data structure that your API expects.
- **Fail-Fast** - Validating a payload before handing it to your application code will catch errors early that would otherwise lead to more confusing errors later.
- **Separate Validation Code** - Manually inspecting a payload for errors can get lengthy and clutter up your application code.
- **Error Messaging** -  Coming up with error messaging for every validation error becomes tedious and inconsistent.
- **Documentation** - Creating a JSON schema documents the API requirements.

## Why validate with express-jsonschema?

`express-jsonschema` is a super thin wrapper around the  [jsonschema]( https://github.com/tdegrunt/jsonschema) library.  The  libary is really popular (10K+ downloads / week) and adheres to latest IETF published draft of JSON schema. Other express validation libraries out there are not that popular and do not follow JSON schema standards.

## express-jsonschema should not be used for:

- **Authentication**. This should be handled upstream by some other middleware.
- **Data dependent validation**.  Sometimes a payload's validity depends on your application data. Two common examples are checking duplicate object ids and user action authorization. This category of validation should be encapsulated in your application business logic.

## Installation

```sh
$ npm install express-jsonschema
```

## API

```js
var express = require('express');
var app = express();
var validateReq = require('express-jsonschema').validateReq;

// Create your own json scehma
var SomeSchema = {
    'type': 'object',
    'properties': {
        'foo': {
            'type': 'string'
        }
    }
}

app.post('/', validateReq('body', SomeSchema), function(req, res) {
    // If req.body matches SomeSchema,
    // your application code can now run knowing
    // req.body is {foo: 'someString'}.
});

// If req.body is invalid a `ValidatorResult` instance is thrown
// that contains information about why the validation failed.

// e.g posting {foo: 1} would throw
//
// {
//     instance: 1,
//     message: 'is not of a type(s) string',
//     property: 'instance.foo',
//     schema: { type: 'string' },
//     stack: 'instance.foo is not of a type(s) string'
// }
```

### validateReq(property, schema, options)

- `property` a string that represents the request property you want to validate.
- `schema` a json schema that describes the expected format of the data in `request[property]`
- `options` an object of options for customizing the validation behavior.

Returns an `express` middleware function that validates `request[property]` against the `schema`.

#### options

##### options.ifInvalid(result, req, res, next)

A function that is called when the request property's value does not match the schema.  As mentioned before, by default, a `ValidatorResult` instance is thrown that contains information about why the validation failed.  You may want throw your own custom error, do some logging, or not throw any error at all and let the route handle the invalid data.

The first argument passed to the callback is `result`, an instance of `ValidatorResult` that contains information about why the validation failed.  The rest of the arguments are the usual `req`, `res`, and `next` middleware params.

```javascript
var options = {
	ifInvalid: function(result, req, res, next){
        // set a bad response status
        res.status(400);

        // log the validation message.
        console.log(result.stack);

        throw result;
    }
}

app.post('/', validateReq('body', SomeSchema, options), function(req, res) {

});
```

##### options.validator

While JSON schemas offer a lot of validation tools out of the box, you may want to add your own custom schema properties.
The `validator` option should be an instance of `Validator`.

```javascript
var jsonchema = require('express-jsonschema');
var Validator = jsonschema.Validator;
var validator = new Validator();
validator.attributes.contains = function validateContains(instance, schema, options, ctx) {
  if(typeof instance!='string') return;
  if(typeof schema.contains!='string') throw new jsonschema.SchemaError('"contains" expects a string', schema);
  if(instance.indexOf()<0){
    return 'does not contain the string ' + JSON.stringify(schema.contains);
  }
}

var FooBarSchema = {
    'type': 'object',
    'properties': {
        'foo': {
            'type': 'string',
            'contains': 'bar'
        }
    }
}

var options = {
	validator: validator
}

app.post('/', validateReq('body', FooBarSchema, options), function(req, res) {
    // You application code can now run knowing
    // req.body.foo contains 'bar'
});
```
For more on creating a custom `Validator` please refer to the [jsonschema]( https://github.com/tdegrunt/jsonschema) documentation.

#### jsonschema options

Within `validateReq` the [jsonschema]( https://github.com/tdegrunt/jsonschema) library is used to do the validating.  It's `Validator.validate` accepts several options.  All options passed to `validateReq` are also passed to the validate function that is called.

To read more about the available `jsonschema` options please refer to the [jsonschema]( https://github.com/tdegrunt/jsonschema) documentation.

## How do I write a jsonschema

- This is a pretty friendly site: http://spacetelescope.github.io/understanding-json-schema/
- This is the jsonschema spec: http://json-schema.org/

## Tests
Tests are written using [mocha](https://www.npmjs.com/package/mocha) and [should](https://www.npmjs.com/package/should).

    npm test

## License

    express-jsonschema is licensed under MIT license.

    Copyright (C) 2015 Adrian Adkison <adkison.adrian@gmail.com>

    Permission is hereby granted, free of charge, to any person obtaining a copy of
    this software and associated documentation files (the "Software"), to deal in
    the Software without restriction, including without limitation the rights to
    use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
    of the Software, and to permit persons to whom the Software is furnished to do
    so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.

[travis-image]: https://img.shields.io/travis/metalculus84/express-jsonschema.svg?style=flat
[travis-url]: https://travis-ci.org/metalculus84/express-jsonschema
[coveralls-image]: https://img.shields.io/coveralls/metalculus84/express-jsonschema.svg?style=flat
[coveralls-url]: https://coveralls.io/r/metalculus84/express-jsonschema?branch=master