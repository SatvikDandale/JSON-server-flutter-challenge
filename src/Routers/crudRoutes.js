const express = require('express');

const crudApp = express.Router({
    mergeParams: true
})

crudApp.get("/hello", async (_, response, __) => {
    response.status(200).send("Hello There");
});

module.exports = crudApp;