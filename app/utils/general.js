const containsPattern = (key, pattern) => {
    const parts = pattern.split(';')
    return parts.reduce((soFar, part) => (soFar && key.includes(part)), true)
}

const getPatternValue = (pattern, data) => {
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            if(containsPattern(key, pattern)){
                return data[key]
            }
        }
    }
    return ''
}

const appendZeros = (n) => {
    if(n <= 9){
        return "0" + n;
    }
    return n
}

const getNextDate = (date) => {
    const [yyyy, mm, dd] = date.split('-')
    var nextDate = new Date(`${date}T00:00:00Z`);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1)
    return `${nextDate.getUTCFullYear()}-${appendZeros(nextDate.getUTCMonth() + 1)}-${appendZeros(nextDate.getUTCDate())}`
}


module.exports = { getPatternValue, getNextDate };