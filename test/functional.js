/* jshint mocha: true */

var request = require('supertest'),
    helpers = require('./helpers'),
    app = require('./testapp');

describe('A route with validation middleware', function() {
    it('should respond with a 200 if the posted body is valid', function(done) {
        request(app)
            .post('/user/')
            .send(helpers.getUser())
            .expect(function(response) {
                response.body.should.eql({id: '1234'});
            })
            .expect(200)
            .end(done);
    });

    it('should respond with a 200 if the posted body is valid and using split schema', function(done) {
        request(app)
            .post('/user/split_schema/')
            .send(helpers.getUser())
            .expect(function(response) {
                response.body.should.eql({id: '1337'});
            })
            .expect(200)
            .end(done);
    });

    it('should respond with a 400 if the posted body is invalid', function(done) {
        request(app)
            .post('/user/')
            .send(helpers.getUser({firstName: undefined}))
            .expect(function(response) {
                response.body.should.eql({
                    validations: {
                        body: [{
                            messages: ['is required'],
                            property: 'request.body.firstName'
                        }]
                    },
                    statusText: 'Bad Request'
                });
            })
            .expect(400)
            .end(done);
    });

    it('should respond with a 400 and separate property validation objects if the posted body ' +
        'has multiple invalid properties', function(done) {
        request(app)
            .post('/user/')
            .send(helpers.getUser({firstName: undefined, lastName: undefined}))
            .expect(function(response) {
                response.body.should.eql({
                    validations: {
                        body: [{
                            messages: ['is required'],
                            property: 'request.body.firstName'
                        }, {
                            messages: ['is required'],
                            property: 'request.body.lastName'
                        }]
                    },
                    statusText: 'Bad Request'
                });
            })
            .expect(400)
            .end(done);
    });

    it('should respond with a 400 and one property validation object if the posted body ' +
        'has one property with multiple invalid aspects', function(done) {
        request(app)
            .post('/user/')
            .send(helpers.getUser({email: 'junk'}))
            .expect(function(response) {
                response.body.should.eql({
                    validations: {
                        body: [{
                            value: 'junk',
                            messages: [
                                'does not conform to the "email" format',
                                'does not meet minimum length of 7',
                                'does not contain the string "terje.com"'
                            ],
                            property: 'request.body.email'
                        }]
                    },
                    statusText: 'Bad Request'
                });
            })
            .expect(400)
            .end(done);
    });

    it('should respond with a 400 if the schema is required ' +
        'and the request body is undefined', function(done) {
        request(app)
            .post('/user/empty_body/')
            .expect(function(response) {
                response.body.should.eql({
                    validations: {
                        body: [{
                            messages: ['is required'],
                            property: 'request.body'
                        }]
                    },
                    statusText: 'Bad Request'
                });
            })
            .expect(400)
            .end(done);
    });

    it('should respond with a 400 and validation for multiple request properties ' +
        'if the schema validates multiple request properties', function(done) {
        request(app)
            .post('/api/user/?token=FRG42G')
            .send(helpers.getUser({firstName: undefined}))
            .expect(function(response) {
                response.body.should.eql({
                    validations: {
                        body: [{
                            messages: ['is required'],
                            property: 'request.body.firstName'
                        }],
                        query: [{
                            value: 'FRG42G',
                            messages: ['does not meet minimum length of 10'],
                            property: 'request.query.token'
                        }]
                    },
                    statusText: 'Bad Request'
                });
            })
            .expect(400)
            .end(done);
    });

    it(
        'should respond with a 200 if the schema is not required ' +
        'and the body is undefined', function(done) {
        request(app)
            .post('/user/create_default/')
            .expect(function(response) {
                response.body.should.eql({id: '1237'});
            })
            .expect(200)
            .end(done);
    });
});
