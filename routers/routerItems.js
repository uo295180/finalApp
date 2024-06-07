const express = require("express")
const database = require("../database")
const routerItems = express.Router();

routerItems.get("/", async (req, res) => {
    database.connect();
    let items = await database.query("Select * from items")

    database.disconnect();
    res.json(items)
})

module.exports = routerItems