1.1.0  / 2015-07-06
==========================================
  - Allow middleware creator to specify dependency schemas for split schemas (@SpainTrain).

1.0.2 / 2015-02-06
==================
  - Pass `JsonSchemaValidation` instance to `next` middleware instead of throwing.
  - Added name properties to error constructors.

1.0.1 / 2015-02-02
==================
  - Fixed README. messages key is an array of strings.

1.0.0 / 2015-02-01
==================

  - added .jscsrc and .jshintrc files for formatting and code integrity
  - moved most of the unit tests over to functional tests as it is a better
    indicator of whether the module is working.
  - dropped object-assign dependency.
  - no longer exporting jsonschema exports.  Users can require jsonschema directly if they are needed.
    - `jsonschema.Validator`
    - `jsonschema.ValidatorResult`
    - `jsonschema.ValidationError`
    - `jsonschema.SchemaError`
    - `jsonschema.validate`
  - `validateReq` is now `validate` and receives one argument, an object where the keys are the request
    properties and the values are the respective schemas.  This is more flexible going forward.
  - `validateReq` allowed options `validator` and `ifInvalid`.  These have been removed as they provide
  little value and complicate the API.


0.0.1-0.0.3 / 2015-01-28
==================

  * Initial build
