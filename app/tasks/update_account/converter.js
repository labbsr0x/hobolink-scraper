//Converts hobolink account data to agrows schema
const { Owner } = require('./schema')
const debug = require('debug')('debug')

function toAgrowsSchema(accountData) {
    debug('Converting Hobolink Account Data to AgroWS Schema')
    debug('Input: %o', accountData)
    const owner = Owner(accountData.username.trim(), 
        `${accountData.firstName.trim()} ${accountData.lastName.trim()}`,
        '', accountData.email.trim())
    debug('Output: %o', owner)
    return owner
}

module.exports = toAgrowsSchema;
