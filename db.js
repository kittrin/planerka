const mysql = require('mysql2');

const connection = mysql.createPool({
    host: "37.140.192.216",
    user: "u1622733_admin",
    database: "u1622733_digital-anapa-bot",
    password: "SXTV5R9H"
}).promise();

module.exports = connection;