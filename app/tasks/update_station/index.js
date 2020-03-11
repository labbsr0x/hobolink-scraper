const Scraper = require('../../scraper/index')
const convert = require('./converter')
const { schema } = require('./schema')
const { assertSchema, assignSchema } = require('../../utils/schemaClient')
const info = require('debug')('info')
const error = require('debug')('*')
const { getNextDate } = require('../../utils/general')
const { postThingMetadata } = require('../../utils/agroDataClient')

const task = async (resolve, reject, username, password, date) => {
    info('Starting updateStation info task ...')

    try {
        let scraper = new Scraper();
        await scraper.Login(username, password)
        const hobolinkStations = await scraper.ExtractStationsInfo()
        scraper.Logout()

        const owner = username;
        
        if (process.env.CHECK_SCHEMAS) {
            await assertSchema(schema);
        } 

        for(let idx=0; idx<hobolinkStations.length; idx++) {
            const data = convert(hobolinkStations[idx])
            const thing = data.serial_number
            await postThingMetadata(owner, thing, data)
            if (process.env.CHECK_SCHEMAS) {
                await assignSchema(`owner/${owner}/thing/${thing}`, schema)
            }
        }
    } catch(webErr) {
        reject(`Error scrapping Station Info from hobolink website: ${webErr}. Check container logs for more details.`)
        error('Error scrapping Station Info from hobolink website: %o.', webErr)
        return
    } finally {
        info('Hobolink station parsing finished!')
    }
    
    resolve({})
}

module.exports = task;