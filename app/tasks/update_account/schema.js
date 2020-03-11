const schema = { 
    uri: "weather_station_owner", fields: [
        {name: "username", type: "short_string", description: "Username do dono da conta. Geralmente o login utilizado na plataforma."},
        {name: "name", type: "short_string", description: "Nome do dono da conta."},
        {name: "address", type: "short_string", description: "Endereço fornecido pelo dono da conta."},
        {name: "email", type: "short_string", description: "Endereço de e-mail fornecido pelo dono da conta."}
    ]
};

const Owner = (username, name, address, email) => ({username, name, address, email});
    
module.exports = { Owner, schema };
