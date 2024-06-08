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

routerItems.post("/", async (req, res) => {
    let name = req.body.name
    let description = req.body.description
    let dateStart = new Date(Date.now());
    let dateFinnish = req.body.dateFinnish
    let initialPrice = req.body.initialPrice
    let idUser = req.body.idUser

    // Validation

    if(name==undefined||description==undefined||dateFinnish==undefined||initialPrice==undefined||idUser==undefined){
        return res.status(400).json({error: "Some value is missing"})
    }

    if(isNaN(initialPrice)){
        return res.status(400).json({error: "Some value is missing"})
    } 
    if(parseFloat(initialPrice) < 0){
        return res.status(400).json({error: "invalid initial price"})
    }

})

module.exports = routerItems