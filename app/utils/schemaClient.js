
const debug = require('debug')('debug')
const info = require('debug')('info')
const trace = require('debug')('trace')
const axios = require('axios');

require('dotenv').config();
info('Setting schema uri to: %s', process.env.SCHEMA_URI)
const schemaApi = axios.create({
    baseURL: process.env.SCHEMA_URI,
});

async function existSchema(schemaUri) {
    debug('getting schema %o from schema api', schemaUri)
    const response = await schemaApi.get(`/v1/schema/${schemaUri}`, {
        validateStatus: (status) => { return status < 500}
    });
    trace('response from schemaApi service %o', response);
    return response.status == 200
}

async function assertSchema(schemaDef) {
    const exists = await existSchema(schemaDef.uri)
    if( !exists) {
        return schemaApi.post(`/v1/schema`, schemaDef);
    }
}

async function assertSchemas(schemas) {
    await Promise.all(schemas.map((schema) => assertSchema(schema.def)));
}

async function assignSchema(domain, schemaDef) {
    await schemaApi.post(`/v1/schema/${schemaDef.uri}/assign`, {
        domain
    });
}

async function assignNodeSchema(owner, thing, schema) {
    await schemaApi.post(`/v1/schema/${schema.def.uri}/assign`, {
        domain: `owner/${owner}/thing/${thing}/node/${schema.node}`
    });
}

module.exports = { assertSchema, assertSchemas, assignSchema, assignNodeSchema };