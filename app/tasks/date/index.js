const Scraper = require('../../scraper/index')
const parser = require('./parser')
const extractSensorsData = require('./converter')
const { schemas } = require('./schemas')
const info = require('debug')('info')
const debug = require('debug')('debug')
const error = require('debug')('*')
const { deleteFolder } = require('../../utils/fileManager')
const { postMultipleReads } = require('../../utils/agroDataClient')
const { assertSchemas, assignNodeSchema } = require('../../utils/schemaClient')
const { getNextDate } = require('../../utils/general')
require('dotenv').config();


const dateTask = async (resolve, reject, username, password, date) => {
    info('Starting dateTask ...')

    let path = '';
    try {
        let scraper = new Scraper();
        await scraper.Login(username, password)
        path = await scraper.DownloadAllSensorsDailyData('agrowsTempExport', date)
        scraper.Logout()
    } catch(webErr) {
        reject(`Error scrapping data from hobolink website: ${webErr}. Check container logs for more details.`)
        error('Error scrapping data from hobolink website: %o. Check container logs for more details.', webErr)
        return
    } finally {
        info('Hobolink scrapping finished!')
    }
    
    try {
        if (process.env.CHECK_SCHEMAS) {
            await assertSchemas(schemas);
        } 
        
        const stationsData = await parser(path)
        for(let stationId in stationsData) {
            debug('Processing data for station %o', stationId)
            debug('Raw data: %o', stationsData[stationId])
            for (let i = 0; i<schemas.length; i++){
                const schema = schemas[i];
                const node = schema.node;
                debug('Processing node %o', node)
                const data = [];
                for(let idx = 0; idx < stationsData[stationId].length; idx++) {
                    const dataElement = stationsData[stationId][idx];
                    const sensorsData = await extractSensorsData(dataElement, schema.sensors);
                    data.push({ dateTime: dataElement.dateTime, ...sensorsData});
                };
                debug("Data extracted for node %o: %o", node, data);
                await postMultipleReads(username, stationId, schema.node, data);
                if (process.env.CHECK_SCHEMAS) {
                    await assignNodeSchema(username, stationId, schema)
                }
            }
            info('Processed %o data reads for station %o', stationsData[stationId].length, stationId)
        }
        
        const filePath = path.split('\/')
        const dirPath = filePath.slice(0, filePath.length - 1).join('\/')
        await deleteFolder(dirPath)
    } catch(fsErr) {
        reject(`IO error while processing data files: ${fsErr}. Check container logs for more details.`)
        error('IO error while processing data files: %o.', fsErr)
        return
    } finally {
        info('File processing finished!')
    }
    

    resolve({date: getNextDate(date)})
}

module.exports = dateTask;