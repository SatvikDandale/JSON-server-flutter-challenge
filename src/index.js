const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
const http = require('http');

const crudRouter = require('./Routers/crudRoutes');
const { initDB, dbRouter } = require('./Database/index');

const corsOptions = {
    origin: "*" // Allow from all origins
}

const app = express();
const jsonParser = bodyParser.json();
app.use(jsonParser);
app.use(cors(corsOptions));
app.use(crudRouter);
app.use(dbRouter)

initDB();

server = http.createServer(app);
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`JSON Server is running on port ${PORT}`));