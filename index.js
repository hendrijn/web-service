const express = require('express');
const service = express();
const fs = require('fs');
const mysql = require('mysql');

const json = fs.readFileSync('credentials.json', 'utf-8');
const credentials = JSON.parse(json);

//cross-origin resource sharing using custom middleware and an options wildcard endpoint.
service.use((request, response, next) => {
    response.set('Access-Control-Allow-Origin', '*');
    next();
});

service.options('*', (request, response) => {
    response.set('Access-Control-Allow-Headers', 'Content-Type');
    response.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
    response.sendStatus(200);
});
//end resource sharing

//create database connection
const connection = mysql.createConnection(credentials);
connection.connect(error => {
    if (error) {
        console.error(error);
        process.exit(1);
    }
});
//end database connection

function rowToObject(row) {
    return {
        id: row.id,
        name: row.name,
        items: row.items,
        total: row.total
    };
}

//*********** HTTP Methods ***********\\
service.get('/orders', (request, response) => {

    const selectQuery = 'SELECT * FROM orders';
    connection.query(selectQuery, (error, rows) => {
        if (error) {
            response.status(500);
            response.json({
                ok: false,
                results: error.message,
            });
        } else {
            const orders = rows.map(rowToObject);
            response.json({
                ok: true,
                results: orders
            });
        }
    });
});
//create the port to listen
const port = 5001;
service.listen(port, () => {
    console.log(`We're live in port ${port}!`);
});
