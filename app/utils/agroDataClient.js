
const debug = require('debug')('debug')
const info = require('debug')('info')
const trace = require('debug')('trace')
const axios = require('axios');

require('dotenv').config();
info('Setting agrodata uri to: %s', process.env.AGRODATA_URI)
const agrodataApi = axios.create({
    baseURL: process.env.AGRODATA_URI,
});

async function postMultipleReads(acc, thing, node, data) {
    debug('posting acc %o read on thing %o node %o with attributes %o', acc, thing, node, data)
    const response = await agrodataApi.post(`/v2/owner/${acc}/thing/${thing}/node/${node}`, data );
    trace('response from agrodata service %o', response);
}

async function postOwnerMetadata(owner, data) {
    debug('posting metadata for owner %o metadata %o', owner, data)
    const response = await agrodataApi.put(`/v2/owner/${owner}`, data );
    trace('response from agrodata service %o', response);
}

async function postThingMetadata(owner, thing, data) {
    debug('posting metadata for owner %o thing %o metadata %o', owner, thing, data)
    const response = await agrodataApi.put(`/v2/owner/${owner}/thing/${thing}`, data );
    trace('response from agrodata service %o', response);
    
}

module.exports = { postMultipleReads, postOwnerMetadata, postThingMetadata  };