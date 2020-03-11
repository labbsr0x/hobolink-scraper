const schema = { 
    uri: "weather_station", fields: [
        {name: "nickname", type: "short_string", description: "Username do dono da conta. Geralmente o login utilizado na plataforma."},
        {name: "serial_number", type: "short_string", description: "Nome do dono da conta."},
        {name: "model", type: "short_string", description: "Endereço fornecido pelo dono da conta."},
        {name: "firmware_version", type: "short_string", description: "Endereço de e-mail fornecido pelo dono da conta."},
        {name: "status", type: "short_string", description: "Endereço de e-mail fornecido pelo dono da conta."}
    ]
};

const Station = (nickname, serial_number, model, firmware_version, status) => ({nickname, serial_number, model, firmware_version, status});
    
module.exports = { Station, schema };
