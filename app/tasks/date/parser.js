const csv = require('csv-parser'); 
const fs = require('fs');
const { extractStationId, extractSensorName }  = require('../../utils/hobolink')
const info = require('debug')('info')
const error = require('debug')('error')
const trace = require('debug')('trace')

function normalizeDate(tsString) {
    //hobolink delivers in the following format: 02/07/19 01:15:00
    //agrows accepts datetime using iso 8601 so we should convert to 2019-07-02T01:15:00Z
    const [date, time] = tsString.split(' ')
    const [mm, dd, yy] = date.split('/')
    return `20${yy}-${mm}-${dd}T${time}Z`
}

function processKey(key) {
    //on hobolink readout file, reads are key -> values and the key follow the mask:
    //"$SENSOR_NAME ($SENSOR_CODE $STATIONID:$SENSORID), $READ_UNIT, $STATION_NAME"
    //Ex: "Solar Radiation (S-LIB 10886250:20190023-1), W/m^2, Estacao_Baus"
    //On this function we will generate the thing for the homie pattern
    const [sensorDesc, unit, stationName] = key.split(',')
    const attribute_key = extractSensorName(sensorDesc)
    return [`${attribute_key};${unit}`, stationName.trim()]
}

async function processFile(filename) {
    //Be aware that this is a csv file and each DATA column is a sensor read from one station
    //The file contains data from all station, so we should first split the data between stations        
    info('Processing file %o', filename)

    const data = await new Promise((resolve, reject) => {
        const result = {}

        fs.createReadStream(filename).pipe(csv()).on('data', (row) => {
            //Reading each row from the csv
            const ts = normalizeDate(row.Date)
            //Filtering to get only data columns
            const keys = Object.keys(row).filter(key => !['Line#', 'Date'].includes(key));
            const stations = {}
            for(let i = 0; i<keys.length; i++) {
                try {
                    const key = keys[i]
                    const stationId = extractStationId(key)
                    if (!(stationId in stations)) {
                        stations[stationId]= { 'dateTime': ts }
                    }
                    const value = row[key]
                    stations[stationId][key] = value
                    trace('Reading value %s for thing %s at %s', value, stationId, ts)
                } catch(err) {
                    error('Unexpected input schema from hobolink file. Maybe the format of the file delivered by admin panel was changed!')
                    reject(err)
                }
            }
            
            for(let stationId in stations) {
                if (!result.hasOwnProperty(stationId)) {
                    result[stationId] = [];
                }
                result[stationId].push(stations[stationId])
            }
        }).on('end', () => {
            info(`CSV file ${filename} successfully processed`);
            resolve(result)
        });
    });

    return data;
    
}

module.exports = processFile;