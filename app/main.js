
/**
 * @name keyboard
 *
 * @desc types into a text editor
 *
 * @see {@link https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagehoverselector}
 */
const ConductorWorker = require('conductor-nodejs-worker');
const info = require('debug')('info')
const debug = require('debug')('debug')
const error = require('debug')('*')
const dateTask = require('./tasks/date/index')
//const dateTask = require('./tasks/update_account/index')
//const dateTask = require('./tasks/update_station/index')

require('dotenv').config();
info('Connecting to conductor using uri: %s', process.env.CONDUCTOR_URI)

const worker = new ConductorWorker({
    url: process.env.CONDUCTOR_URI, // host
    apiPath: '/api', // base path
    workerid: 'node-worker',
})

const taskType = 'hobolink_date'

const fn = (input) => {
    info('Executing task %o with input: %o', taskType, input)
    return new Promise((resolve, reject) => {
        //validating input parameters
        if(!input.username || !input.password || !input.date ){
            const invalidReason = 'Rejected invalid task: NO USERNAME OR PASSWORD PROVIDED'
            reject(invalidReason)
            error(invalidReason)
            return
        }
        debug('Valid task, processing now...')
        dateTask(resolve, reject, input.username, input.password, input.date)
    })
}

worker.Start(taskType, fn, 1000)

