import Ajv2020 from 'ajv/dist/2020.js'

const ajv = new Ajv2020()
ajv.addFormat('firstname', (v) => v.length > 16)

const schema = {
    type: 'object',
    properties: {
        email: {type: 'string', minLength: 2, maxLength: 255},
        isCompany: {type: 'boolean'},
        legalName: {type: 'string', minLength: 2, maxLength: 255},
        firstname: {type: 'string', format: 'firstname'},
    },
    required: ['email', 'isCompany'],
    if: {
        properties: {isCompany: {const: true}}
    },
    then: {
        properties: {legalName: {type: 'string'}},
    },
    else: {
        required: ['firstname']
    }
}

const validate = ajv.compile(schema)

if (!validate({ email: 'asd@fgh.com', isCompany: false, firstname: 'John' })) {
    console.log('invalid payload', validate.errors)
}
