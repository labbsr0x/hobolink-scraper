const util = require('util')
const EventEmitter = require('events').EventEmitter
const clients = require('restify-clients')
const pForever = require('p-forever')
const sleep = require('sleep-promise')
 
function ConductorWorker(options) {
    EventEmitter.call(this)
    this.url = options.url
    this.apiPath = options.apiPath
    this.workerid = options.workerid
    this.client = clients.createJsonClient({
        url: this.url,
    })
}
util.inherits(ConductorWorker, EventEmitter)

module.exports = ConductorWorker

ConductorWorker.prototype.pollAndWork = function (taskType, fn) { // keep 'function'
  console.log('ConductorWorker.pollAndWork called')
  const that = this
  return new Promise((resolve, reject) => {
    console.log('Polling task to work from', `${that.apiPath}/tasks/poll/${taskType}?workerid=${that.workerid}`)    
    that.client.get(`${that.apiPath}/tasks/poll/${taskType}?workerid=${that.workerid}`, (err, req, res, obj) => {
      if (err) {
        reject(err)
        return
      }

      console.log('pooled object', obj)
      if (res.statusCode === 204) {
        resolve(null)
        return
      }
      const input = obj.inputData || {}
      const { workflowInstanceId, taskId } = obj
      that.client.post(`${that.apiPath}/tasks/${taskId}/ack?workerid=${that.workerid}`, {}, (err, req, res, obj) => {
        if (err){
          console.log('Couldnt make ACK TASK request', err)
          reject(err)
          return
        }
        // console.log('ack?: %j', obj)
        if (obj !== true) {
          resolve({
            reason: 'FAILED_ACK',
            workflowInstanceId,
            taskId
          })
          return
        }
        const t1 = Date.now()
        const result = {
          workflowInstanceId,
          taskId,
        }
        fn(input).then(output => {
          result.callbackAfterSeconds = (Date.now() - t1)/1000
          result.outputData = output
          result.status ='COMPLETED'
          that.client.post(`${that.apiPath}/tasks/`, result, (err, req, res) => {
            if(res.statusCode >= 300){
              console.log('COMPLETE COMPLETE request ERROR')
              reject(err)
              return
            }
            
            resolve({
              reason: 'COMPLETED',
              workflowInstanceId,
              taskId
            })

          })
        }, (err) => {
          result.callbackAfterSeconds = (Date.now() - t1)/1000
          result.reasonForIncompletion = err // If failed, reason for failure
          result.status ='FAILED'
          that.client.post(`${that.apiPath}/tasks/`, result, (err, req, res, obj) => {
            // err is RestError: Invalid JSON in response, ignore it
            // console.log(obj)
            if(res.statusCode >= 300){
              console.log('FAILED TASK request ERROR')
              reject(err)
              return
            }
            resolve({
              reason: 'FAILED',
              workflowInstanceId,
              taskId
            })
          })
        })
      })
    })
  })
}

ConductorWorker.prototype.Start = function (taskType, fn, interval) {
  console.log('ConductorWorker.Start called')

  const that = this
  this.working = true
  pForever(async () => {
    if (that.working) {
      console.log('Sleeping for ', interval || 1000)
      await sleep(interval || 1000)
      return that.pollAndWork(taskType, fn).then(data => {
        if(data!=null) {
          console.log('[WORKER] ' + data.reason + ' workflowInstanceId=' + data.workflowInstanceId + '; taskId=' + data.taskId)
        } else {
          console.log('[WORKER] THERE WAS NO TASK TO POLL')
        }
      }, (err) => {
        console.log('[WORKER] COMMUNICATION FAILURE -> NETWORK OR SERVER ERROR:', err)
      })
    } else {
      return pForever.end
    }
  })
}

ConductorWorker.prototype.Stop = function (taskType, fn) {
  console.log('ConductorWorker.Stop called')

  this.working = false
}
