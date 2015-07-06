# express-jsonschema

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]

[express.js]( https://github.com/visionmedia/express ) middleware for JSON schema validation.

## Why validate with express-jsonschema?

- It makes setting up request validation simple and gets out of your way.
- It makes no assumptions about how you want to handle invalid data. Response status codes, message formatting, content type, and logging strategies are not one size fits all.
- It leverages the [jsonschema][jsonschema-url] library to conduct JSON schema validation. `jsonschema` is popular (10K+ downloads / week) and adheres to the latest IETF published v4 draft of JSON schema.

## Why validate with JSON schemas?

- **Simple** - JSON schemas are a simple and expressive way to describe a data structure that your API expects.
- **Standard** - JSON schemas are not specific to javascript. They are used in many server side languages. The standard specification lives here [jscon-schema.org][json-schema-url].
- **Fail-Fast** - Validating a payload before handing it to your application code will catch errors early that would otherwise lead to more confusing errors later.
- **Separate Validation** - Manually inspecting a payload for errors can get lengthy and clutter up your application code.
- **Error Messaging** -  Coming up with error messaging for every validation error becomes tedious and inconsistent.
- **Documentation** - Creating a JSON schema documents the API requirements.

## Installation

```sh
$ npm install express-jsonschema
```

## API

```js
var express = require('express');
var app = express();
var validate = require('express-jsonschema').validate;

// Create a json scehma
var StreetSchema = {
    type: 'object',
    properties: {
        number: {
            type: 'number',
            required: true
        },
        name: {
            type: 'string',
            required: true
        },
        type: {
            type: 'string',
            required: true
            enum: ['Street', 'Avenue', 'Boulevard']
        }
    }
}

app.post('/street/', validate({body: StreetSchema}), function(req, res) {
    // application code
});
```

A valid post body:

```js
{
    number: 12,
    name: 'Sycamore',
    type: 'Street'
}
```

An invalid post body:

```js
{
    number: '12',      // This should be a number
                       // A 'name' key is missing
    type: 'Drive'      // 'Drive' is not one of the valid types
}
```

Posting the above object would throw a `JsonSchemaValidation` instance that would look like this

```js
jsonSchemaValidation.validations.body[0]

{
  value: '12',
  messages: ['is not of a type(s) integer'],  // you can have multiple validations
  property: 'request.body.number',
}

jsonSchemaValidation.validations.body[1]

{
  messages: ['is required'],
  property: 'request.body.name'
}

jsonSchemaValidation.validations.body[2]

{
  value: 'Drive',
  messages: ['is not one of enum values: Street, Avenue, Boulevard'],
  property: 'request.body.type'
}
```

## Validating multiple request properties

Sometimes your route may depend on the `body` and `query` both having a specific format.  In this
example I use `body` and `query` but you can choose to validate any `request` properties you'd like.

```js
var TokenSchema = {
    type: 'object',
    properties: {
        token: {
            type: 'string',
            format: 'alphanumeric',
            minLength: 10,
            maxLength: 10,
            required: true
        }
    }
}

app.post('/street/', validate({body: StreetSchema, query: TokenSchema}), function(req, res) {
    // application code
});
```

A valid request would now also require a url like `/street/?token=F42G5N5BGC`.

## Handling invalid data

As mentioned before, how one handles an invalid request depends on their application. You can easily
create some [express error middleware](http://expressjs.com/guide/error-handling.html) to customize how your application behaves. When the `validate` middleware finds invalid data it passes an instance of `JsonSchemaValidation` to the
next middleware. Below is an example of how to handle invalid data.

```js
app.use(function(err, req, res, next) {
    var responseData;
    if (err.name === 'JsonSchemaValidation') {

        // Log the error however you please
        console.log(err.message);
        // logs "express-jsonschema: Invalid data found"

        // Set a bad request http response status
        res.status(400);

        // Format the response body
        responseData = {
           statusText: 'Bad Request',
           jsonSchemaValidation: true,
           validations: err.validations  // All of your validation information
        };

        // Respond with the right content type
        if (req.xhr || req.get('Content-Type') === 'application/json') {
            res.json(responseData);
        } else {
            res.render('badrequestTemplate', responseData);
        }

    } else {
        // pass error to next error middleware handler
        next(err);
    }
});


```

## Creating custom schema properties

While JSON schema comes with a lot of validation properties out of the box, you may want to add your own
custom properties. `addSchemaProperties` allows you to extend the validation properties that can be used in your
schemas. It should be called once at the beginning of your application so that your schemas will
have the custom properties available.

```javascript
var addAttributes = require('express-jsonschema').addSchemaProperties;

addSchemaProperties({
    contains: function(value, schema){
        ...
    },
    isDoubleQuoted: function(value, schema){
        ...
    }
});
```
See [jsonschema's how to create custom properties](https://github.com/tdegrunt/jsonschema#custom-properties).

## Complex example, with split schemas and references

```js
var express = require('express');
var app = express();
var validate = require('express-jsonschema').validate;

// Address, to be embedded on Person
var AddressSchema = {
    "id": "/SimpleAddress",
    "type": "object",
    "properties": {
        "street": {"type": "string"},
        "zip": {"type": "string"},
        "city": {"type": "string"},
        "state": {"type": "string"},
        "country": {"type": "string"}
    }
};

// Person
var PersonSchema = {
    "id": "/SimplePerson",
    "type": "object",
    "properties": {
        "name": {"type": "string"},
        "address": {"$ref": "/SimpleAddress"}
    }
};

app.post('/person/', validate({body: PersonSchema}, [AddressSchema]), function(req, res) {
    // application code
});
```

A valid post body:

```json
{
    "name": "Barack Obama",
    "address": {
        "street": "1600 Pennsylvania Avenue Northwest",
        "zip": "20500",
        "city": "Washington",
        "state": "DC",
        "country": "USA"
    }
}
```

## More documentation on JSON schemas

- [scpacetelescope's understanding json schema](http://spacetelescope.github.io/understanding-json-schema/)
- [jsonschema][jsonschema-url]
- [json-schema.org][json-schema-url]
- [json schema generator](http://jsonschema.net/)
- [json schema google group](https://groups.google.com/forum/#!forum/json-schema)

## Notes

You can declare that something is required in your schema in two ways.

```js
{
    type: 'object',
    properties: {
        foo: {
            type: 'string',
            required: true
        }
    }
}

// OR

{
    type: 'object',
    properties: {
        foo: {
            type: 'string'
        },
        required: ['foo']
    }
}
```
The first method works as expected with [jsonschema][jsonschema-url]. The second way has a few gotchas. I recommend using the first.

## Tests
Tests are written using [mocha](https://www.npmjs.com/package/mocha), [should](https://www.npmjs.com/package/should),
and [supertest](https://www.npmjs.com/package/supertest).

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


[npm-image]: https://img.shields.io/npm/v/express-jsonschema.svg?style=flat
[npm-url]: https://npmjs.org/package/express-jsonschema
[travis-image]: https://img.shields.io/travis/trainiac/express-jsonschema.svg?style=flat
[travis-url]: https://travis-ci.org/trainiac/express-jsonschema
[coveralls-image]: https://img.shields.io/coveralls/trainiac/express-jsonschema.svg?style=flat
[coveralls-url]: https://coveralls.io/r/trainiac/express-jsonschema?branch=master
[downloads-image]: https://img.shields.io/npm/dm/express-jsonschema.svg?style=flat
[downloads-url]: https://npmjs.org/package/express-jsonschema
[json-schema-url]: http://json-schema.org/
[jsonschema-url]: https://github.com/tdegrunt/jsonschema
