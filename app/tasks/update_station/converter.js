//Converts hobolink station data to agrows schema
const { Station } = require('./schema')
const debug = require('debug')('debug')

function toAgrowsSchema(stationData) {
    debug('Converting Hobolink Station Data to AgroWS Schema')
    debug('Input: %o', stationData)
    const station = Station(stationData.nickname.trim(), 
        stationData.serial_number.trim(), 
        stationData.model.trim(),
        stationData.firmware_version.trim(),
        stationData.status.trim())
    debug('Output: %o', station)
    return station
}

module.exports = toAgrowsSchema;
