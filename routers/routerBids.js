const express = require("express")
const database = require("../database")
const routerBids = express.Router();

routerBids.get("/", async (req,res) => {
    let idUser = req.query.idUser
    let idItem = req.query.idItem

    database.connect();
    let bids = []
    if(idItem != undefined && idUser==undefined){
        bids = await database.query("SELECT b.*, u.email FROM bids b JOIN users u ON b.idUser = u.id WHERE b.idItem = ?", [idItem])
    } else if (idItem == undefined && idUser != undefined){
        bids = await database.query("SELECT b.*, u.email FROM bids b JOIN users u ON b.idUser = u.id WHERE b.idUser = ?", [idUser])
    } else if ( idItem != undefined && idUser != undefined){
        bids = await database.query("SELECT b.*, u.email FROM bids b JOIN users u ON b.idUser = u.id WHERE b.idItem = ? AND b.idUser = ?", [idItem, idUser])
    } else{
        bids = await database.query("SELECT b.*, u.email FROM bids b JOIN users u ON b.idUser = u.id")
    }
    database.disconnect();
    res.json(bids)
})

routerBids.get("/higher", async (req,res) => {
    let idItem = req.query.idItem
    if ( idItem == undefined) {
        return res.status(400).json({error: "No id"})
    }
    database.connect()

    let items = undefined

    items = await database.query("SELECT b.*, u.email FROM bids b JOIN users u ON u.id = b.idUser WHERE b.idItem = ? ORDER BY b.amount DESC",
        [idItem])
    
    if(items.length < 1){
        database.disconnect()
        return res.status(400).json({ error: "This bid does not exist" })
    }
    database.disconnect()
    res.json(items[0])

})

routerBids.get("/:id", async (req,res) => {
    let id = req.params.id
    if ( id == undefined) {
        return res.status(400).json({error: "No id"})
    }
    database.connect()

    let items = undefined

    items = await database.query("SELECT b.*, u.email FROM bids b JOIN users u ON u.id = b.idUser WHERE b.id = ?",
        [id])
    
    if(items.length < 1){
        database.disconnect()
        return res.status(400).json({ error: "This bid does not exist" })
    }
    database.disconnect()
    res.json(items)

})

module.exports = routerBids