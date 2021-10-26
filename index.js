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

//create middleware for unpacking JSON bodies
service.use(express.json());
//end middleware

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
//displays all the orders present on the database
service.get('/', (request, response) => {
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

//displays the order for a given name
service.get('/orders/:name', (request, response) => {
    const parameters = [request.params.name];
    const selectQuery = 'SELECT * FROM orders WHERE name = ?';
    connection.query(selectQuery, parameters, (error, rows) => {
        if (error) {
            response.status(500);
            response.json({
                ok: false,
                results: error.message,
            });
        } else {
            const order = rows.map(rowToObject);
            response.json({
                ok: true,
                results: order
            });
        }
    });
});

//adds an order to the database
service.post('/orders', (request, response) => {
    if (request.body.hasOwnProperty('name') &&
        request.body.hasOwnProperty('items') &&
        request.body.hasOwnProperty('total')) {

        const parameters = [
            request.body.name,
            request.body.items,
            request.body.total
        ];

        const insertQuery = 'INSERT INTO orders(name, items, total) VALUES (?, ?, ?)';
        connection.query(insertQuery, parameters, (error, result) => {
            if (error) {
                response.status(500);
                response.json({
                    ok: false,
                    results: error.message,
                });
            } else {
                response.json({
                    ok: true,
                    results: result.insertId,
                });
            }
        });

    } else {
        response.status(400);
        response.json({
            ok: false,
            results: 'Incomplete memory.',
        });
    }
});

//deletes the order for a given name
service.delete('/orders/:name', (request, response) => {
    const parameters = [request.params.name];
    const deleteQuery = 'DELETE FROM orders WHERE name = ?';
    connection.query(deleteQuery, parameters, (error, rows) => {
        if (error) {
            response.status(500);
            response.json({
                ok: false,
                results: error.message,
            });
        } else {
            response.json({
                ok: true,
                results: `${request.params.name}'s order is deleted.`
            });
        }
    });
});

//create the port to listen
const port = 5001;
service.listen(port, () => {
    console.log(`We're live in port ${port}!`);
});
