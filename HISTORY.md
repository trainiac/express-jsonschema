1.0.0 / 2015-02-01
==================

  - added .jscsrc and .jshintrc files for formatting and code integrity
  - moved most of the unit tests over to functional tests as it is a better
    indicator of whether the module is working.
  - dropped object-assing dependency.
  - no longer exporting jsonschema exports.  Users can require jsonschema directly if they are needed.
    - `jsonschema.Validator`;
    - `jsonschema.ValidatorResult`;
    - `jsonschema.ValidationError`;
    - `jsonschema.SchemaError`;
    - `jsonschema.validate`;
  - `validateReq` is now `validate` and receives one argument, an object where the keys are the request
    properties and the values are the respective schemas.  This is more flexible going forward.
  - `validateReq` allowed options `validator` and `ifInvalid`.  These have been removed as they provide
  little value and complicate the API.


0.0.1-0.0.3 / 2015-01-28
==================

  * Initial build