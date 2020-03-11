
const csv = require('csv-parser'); 
const fs = require('fs');
const extractSensorName = require('../../utils/hobolink')
const postSingleRead = require('../../utils/agroDataClient')
const info = require('debug')('info')
const debug = require('debug')('debug')
const trace = require('debug')('trace')

async function processFile(filename, account) {
    info('Processing file %o', filename)
    await fs.createReadStream(filename).pipe(csv()).on('data', async (row) => {
        const ts = row.Date
        const keys = Object.keys(row).filter(key => !['Line#', 'Date'].includes(key));
        for(let i = 0; i<keys.length; i++) {
            const key = keys[i]
            const sensorName= extractSensorName(key)
            const value  = row[key]
            debug('Reading value for sensor %s at %s = %s', sensorName, ts, value)
            const [prodCode, devSerial, sensorSerial] = sensorName.split(';')
            //post to homie rest adapter here
            await postSingleRead(account, prodCode, `${devSerial};${sensorSerial}`, value)
        }
    }).on('end', () => {
        info(`CSV file ${filename} successfully processed`);
    });
}



module.exports = processFile;