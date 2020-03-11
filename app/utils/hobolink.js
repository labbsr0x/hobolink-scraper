const trace = require('debug')('trace')

//on hobolink readout file, reads are key -> values and the key follow the mask:
//"$SENSOR_NAME, ($SENSOR_CODE $STATIONID:$SENSORID), $READ_UNIT, $STATION_NAME"
//Ex: input  "Solar Radiation (S-LIB 10886250:20190023-1), W/m^2, Estacao_Baus"
//    output  
const extractSensorName = (fileKey) => {
    trace('Extracting sensor name from string %s', fileKey)
    const regExp = /([^(]+)/;
    const matches = regExp.exec(fileKey);
    if(matches.length < 1){
        throw Error ('Invalid sensor name!')
    }
    const sensorName = matches[0].trim()
    trace('Sensor name extracted', sensorName)
    return sensorName
}

const extractStationId = (fileKey) => {
    trace('Extracting sensor id from string %s', fileKey)
    const regExp = /\(([^)]+)\)/;
    const matches = regExp.exec(fileKey);
    if(matches.length < 1){
        throw Error ('Invalid sensor name! No product and serial number')
    }
    const sensorName = matches[0].replace(/\(|\)/g,'').replace(/\s|\:/g, ';')
    const [ , devSerial, ] = sensorName.split(';')
    trace('Sensor Id extracted', devSerial)
    return devSerial
}

module.exports = { extractStationId, extractSensorName };