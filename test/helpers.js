var merge = require('merge');

module.exports = {
    getTokenSchema: function(overrides) {
        return merge.recursive(true, {
            'type': 'object',
            'properties': {
                'token': {
                    'type': 'string',
                    'format': 'alphanumeric',
                    'minLength': 10,
                    'maxLength': 10,
                    'required': true
                }
            }
        }, overrides || {});
    },
    getAddressSchema: function(overrides) {
        return merge.recursive(true, {
            'id': '/AddressSchema',
            'type': 'object',
            'properties': {
                'street': {
                    'type': 'string',
                    'required': true
                },
                'country': {
                    'type': 'string',
                    'required': true
                },
                'city': {
                    'type': 'string',
                    'required': true
                }
            }
        }, overrides || {});
    },
    getUserSchema: function(overrides) {
        return merge.recursive(true, {
            'id': '/UserSchema',
            'type': 'object',
            'properties': {
                'firstName': {
                    'type': 'string',
                    'required': true
                },
                'lastName': {
                    'type': 'string',
                    'required': true
                },
                'email': {
                    'type': 'string',
                    'format': 'email',
                    'minLength': '7',
                    'contains': 'terje.com',
                    'required': true
                },
                'address': {
                    'type': 'object',
                    'properties': {
                        'street': {
                            'type': 'string',
                            'required': true
                        },
                        'country': {
                            'type': 'string',
                            'required': true
                        },
                        'city': {
                            'type': 'string',
                            'required': true
                        }
                    }
                },
                'songs': {
                    'type': 'array',
                    'minItems': 1,
                    'items': {
                        'type': 'string'
                    },
                    'required': true
                }
            },
            'required': true
        }, overrides || {});
    },
    getUser: function(overrides) {
        return merge.recursive(true, {
            firstName: 'Todd',
            lastName: 'Terje',
            email: 'todd@terje.com',
            address: {
                street: '1 Aasta Hansteens vei',
                country: 'Norway',
                city: 'Oslo'
            },
            songs: [
                'Inspector Norse'
            ]
        }, overrides || {});
    }
};
