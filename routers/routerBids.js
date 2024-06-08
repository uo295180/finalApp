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

routerBids.post("/", async (req, res) => {
    let idItem = req.body.idItem
    let idUser = req.body.idUser
    let amount = req.body.amount
    let date = new Date(Date.now());
    
    if(idItem == undefined || idUser == undefined || amount == undefined){
        return res.status(400).json({error: "Some value is missing"})
    }

    database.connect();

    let items = await database.query("SELECT * FROM items WHERE id = ?", [idItem])
    if(date > items[0].dateFinnish){
        database.disconnect();
        return res.status(400).json({error: "bid is out of date"})
    }

    if(parseFloat(amount) <= items[0].initialPrice){
        database.disconnect();
        return res.status(400).json({ error: "Amount lower than initial price"})
    }

    let highestActualBid = await database.query("SELECT b.*, u.email FROM bids b JOIN users u ON u.id = b.idUser WHERE b.idItem = ? ORDER BY b.amount DESC",[idItem])

    if(highestActualBid.length > 0 && parseFloat(amount) < highestActualBid[0].amount){
        database.disconnect();
        return res.status(400).json({ error: "your bid is smaller than the highest bid for the item " + idItem + ", that is " + highestActualBid[0].amount + " by the user " + highestActualBid[0].email})
    }

    let info = await database.query("INSERT INTO bids (idItem, idUser, amount, date) VALUES (?,?,?,?)", [idItem,idUser,amount,date])


    database.disconnect();
    res.json(info)
    
})

routerBids.delete("/:id", async (req,res) => {
    let id = req.params.id
    if(id == undefined){
        return res.status(400).json({error: "no id params"})
    }
    database.connect();
    let deleted;
    try{
        deleted = await database.query("DELETE FROM bids WHERE id = ?", [id])
    } catch( e ){
        database.disconnect();
        return res.status(400).json({ error: "error in delete bid" })
    } 
    database.disconnect();
    res.json({deletedBid: true, bid: deleted})
})

module.exports = routerBids