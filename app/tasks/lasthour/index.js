const Scraper = require('../../scraper/index')
const parse = require('./parser')
const fs = require('fs');
const info = require('debug')('info')
const debug = require('debug')('debug')
const trace = require('debug')('trace')
const util = require('util');

const lastHour = async (resolve, reject, username, password) => {
    trace('Starting lastHour function...')
        
    let scraper = new Scraper();
    await scraper.Login(username, password)
    await scraper.GoToExportSection()
    const path = await scraper.DownloadExport('agroWsLastHour')
    await scraper.Logout()
    
    const { size } = await util.promisify(fs.stat)(path);
    debug('Filename %s Size %s', path, `${size}B`)

    await parse(path, username)
    await fs.unlinkSync(path)
    info('Deleted file: %s', path)
    
    resolve({})
}

module.exports = lastHour;