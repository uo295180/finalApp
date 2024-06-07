const express = require("express")
const database = require("../database")
const routerItems = express.Router();

routerItems.get("/", async (req, res) => {
    let idUser = req.query.idUser

    database.connect();
    let items = undefined
    if(idUser != undefined){
        items = await database.query("SELECT i.*, u.email FROM items i JOIN users u ON u.id = i.idUser WHERE i.idUser = ?",[idUser])
    }else{
        items = await database.query("SELECT i.*, u.email FROM items i JOIN users u ON u.id = i.idUser")
    }
    database.disconnect();
    res.json(items)
})

routerItems.get("/:id", async (req, res) => {
    let id = req.params.id;
    if(id == undefined){
        return res.status(400).json({error: "no id param"})
    }

    database.connect()
    let items = await database.query("SELECT i.*, u.email FROM items i JOIN users u ON u.id = i.idUser WHERE i.id = ?",
        [id])
    if (items.length < 1) {
        database.disconnect();
        return res.status(400).json({error: "no item with this id"})
    }
    database.disconnect();
    res.json(items[0])
})

module.exports = routerItems