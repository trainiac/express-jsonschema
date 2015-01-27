var assign = require('object-assign');

module.exports = {
    UserSchema: {
        'id': '/UserSchema',
        'type': 'object',
        'properties': {
            'id': {
                'type': 'integer'
            },
            'firstName': {
                'type': 'string'
            },
            'lastName': {
                'type': 'string'
            },
            'address': {
                'type': 'object',
                'properties': {
                    'street': {
                        'type': 'string'
                    },
                    'country': {
                        'type': 'string'
                    },
                    'city': {
                        'type': 'string'
                    },
                }
            },
            'songs': {
                'type': 'array',
                'minItems': 1,
                'items': {
                    'type': 'string'
                }
            }
        }
    },
    getUser: function(overrides) {
        return assign({
            id: 123,
            firstName: 'Todd',
            lastName: 'Terje',
            adress: {
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
