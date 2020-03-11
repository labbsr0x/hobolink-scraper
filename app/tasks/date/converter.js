//Converts hobolink data files to agrows schema
const { getPatternValue } = require('../../utils/general')
const trace = require('debug')('trace')

async function extractSensorsData(stationData, sensors) {
    trace('Calling extractSensorData with stationData=%o and sensors=%o', stationData, sensors)
    const data = {}
    for (let pattern in sensors) {
        if (sensors.hasOwnProperty(pattern)) {
            const val = getPatternValue(pattern, stationData)
            const agrowsKey = sensors[pattern]
            if(agrowsKey != null && agrowsKey != undefined) {
                data[agrowsKey] = val
            }
            trace('Extracted data for pattern %o is: {%o: %o}', pattern,  agrowsKey, val)
        }
    }
    return data
}

module.exports = extractSensorsData;