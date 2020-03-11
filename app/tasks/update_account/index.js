const Scraper = require('../../scraper/index')
const convert = require('./converter')
const { postOwnerMetadata } = require('../../utils/agroDataClient')
const info = require('debug')('info')
const error = require('debug')('*')

const task = async (resolve, reject, username, password, date) => {
    info('Starting updateAccount info task ...')

    try {
        let scraper = new Scraper()
        await scraper.Login(username, password)
        const hobolinkAccountInfo = await scraper.ExtractAccountInfo()
        await scraper.Logout()
        const agrowsAccount = convert(hobolinkAccountInfo)
        await postOwnerMetadata(username, agrowsAccount)
    } catch(webErr) {
        reject(`Error scrapping Account Info from hobolink website: ${webErr}. Check container logs for more details.`)
        error('Error scrapping Account Info from hobolink website: %o. Check container logs for more details.', webErr)
        return
    } finally {
        info('Hobolink account parsing finished!')
    }
    
    resolve({})
}

module.exports = task;