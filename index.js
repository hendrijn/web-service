const { response } = require('express');
const express = require('express');
const service = express();
service.use(express.json());

//allows localhost access
service.use((request, response, next) => {
    response.set('Access-Control-Allow-Origin', '*');
    next();
});

service.options('*', (request, response) => {
    response.set('Access-Control-Allow-Headers', 'Content-Type');
    response.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
    response.sendStatus(200);
});

const port = 5001;
service.listen(port, () => {
    console.log(`We're live on port ${port}!`);
});

const orders = {};
let orderNumber = 0;

//gets all orders
service.get('/orders', (request, response) => {
    response.json({
        ok: true,
        results: orders
    })
});

//gets an order by number
service.get('/orders/:custName', (request, response) => {
    const custName = request.params.custName;
    if (!orders.hasOwnProperty(custName)) {
        response.status(400);
        response.json({
            ok: false,
            results: `${custName} does not exist.`
        });
    } else {
        response.json({
            ok: true,
            name: custName,
            results: orders[custName]
        });
    }
});

//adds an order
service.post('/orders/:custName', (request, response) => {
    const custName = request.params.custName;

    const orderInfo = {
        "orderNumber": orderNumber++,
        "items": request.body.items,
        "total": request.body.total
    }
    orders[custName] = orderInfo;

    response.json({
        ok: true,
        results: {
            name: custName,
            order: orders[custName]
        }
    })
});

//delets an order
service.delete('/orders/:custName', (request, response) => {
    const custName = request.params.custName;

    if (!orders.hasOwnProperty(custName)) {
        response.status(400);
        response.json({
            ok: false,
            results: `There is no order for ${custName}.`
        });
    } else {
        delete orders[custName];
        response.json({
            ok: true,
        });
    }
});

//edit customer name for order
service.patch('/orders/:custName', (request, response) => {
    const custName = request.params.custName;

    if (!orders.hasOwnProperty(custName)) {
        response.status(400);
        response.json({
            ok: false,
            results: `There is no order for ${custName}.`
        });
    } else {
        orders[request.body.name] = orders[custName];
        delete orders[custName];
        response.json({
            ok: true,
            results: orders[request.body.name]
        });
    }

});
