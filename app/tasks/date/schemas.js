
const temperature = { 
    node: "temperature",
    def: {
        uri: "wheater_instant_temperature", fields: [
            {name: "temperature", type: "decimal", description: "Temperatura em Graus Celsius."},
        ]
    },
    sensors: {
        'S-TMB': 'temperature',
    },
};

const wind = { 
    node: "wind",
    def: {
        uri: "weather_instant_wind", fields: [
            {name: "wind_speed", type: "decimal", description: "Valor de velocidade do vento."},
            {name: "wind_gust", type: "decimal", description: "Pico de intesidade de vento."},
            {name: "wind_direction", type: "decimal", description: "Direção do vento."},
        ],
    },
    sensors: {
        'S-WSB': 'wind_speed',
        'S-WSB;-2': 'wind_gust',
        'S-WDA': 'wind_direction',
    }
};

const radiation = { 
    node: "radiation",
    def: {
        uri: "wheater_instant_radiation", fields: [
            {name: "solar_radiation", type: "decimal", description: "Valor de radiação solar."},
        ],
    },
    sensors: {
        'S-LIB': 'solar_radiation',
    }
}
const humidity = { 
    node: 'humidity',
    def: {
        uri: "wheater_instant_humidity", fields: [
            {name: "precipitation", type: "decimal", description: "Medição de chuva em milimetros."},
            {name: "humidity", type: "decimal", description: "Medição de humidade relativa do ar em valores percentuais."},
            {name: "dew_point", type: "decimal", description: "Medição de ponto de orvalho."},
        ],
    },
    sensors: {
        'S-RGB': 'precipitation',
        'S-THB;-2': 'humidity',
        'S-THB;-3': 'dew_point',
    }
}

const schemas = [ temperature, wind, radiation, humidity ];

module.exports = { temperature, wind, radiation, humidity, schemas };