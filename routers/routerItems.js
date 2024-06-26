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
    let dateFinnish = new Date(req.body.dateFinnish)
    let initialPrice = req.body.initialPrice
    let idUser = req.infoApikey.id

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
    if(dateFinnish < dateStart){
        return res.status(400).json({error: "DateFinnish is previous than start date"})
    }

    database.connect();

    let insertedItem;
    try{
        insertedItem = await database.query(
            "INSERT INTO ITEMS (idUser,name,description,dateStart,dateFinnish,initialPrice) VALUES (?,?,?,?,?,?)"
        , [idUser,name,description,dateStart,dateFinnish,initialPrice])
    } catch(e){
        database.disconnect();
        return res.status(400).json({error: "error al insertar una puja"})
    }

    database.disconnect();
    res.json(insertedItem)
    

})

routerItems.put("/:id", async (req, res) => {
    let id = req.params.id
    let name = req.body.name
    let description = req.body.description
    let initialPrice = req.body.initialPrice
    let errors = []
    let dateFinnish = req.body.dateFinnish;

    if(id==undefined){ errors.push({error: "No id found"})}
    if(name==undefined){ errors.push({error: "No name found"})}
    if(description==undefined){ errors.push({error: "No description found"})}
    if(initialPrice==undefined){ errors.push({error: "No initial price found"})}
    if(dateFinnish==undefined) {errors.push({error: "No date finnish found"})}
    
    try{
        dateFinnish = new Date(req.body.dateFinnish)
    } catch( e ){
        errors.push({error: "Invalid date format"})
    }


    if(errors.length > 0) {
        return res.status(400).json({errors: errors})
    }

    database.connect();

    let updateItem;
    try{
        updateItem = await database.query(
            "UPDATE items SET name = ?, description = ?, initialPrice = ?, dateFinnish = ? WHERE id=? AND idUser = ?",
            [name, description,initialPrice,dateFinnish,id,req.infoApikey.id])
    } catch( e ){
        database.disconnect();
        res.status(400).json({error: "error in update items"})
    }

    database.disconnect()
    res.json({modified: updateItem})
})

routerItems.delete("/:id", async (req,res) => {
    let id = req.params.id
    if(id == undefined){
        return res.status(400).json({error: "no id param"})
    }

    database.connect();
    let deletedBids;
    let deletedItem;
    try{
        let items = await database.query("SELECT * FORM items WHERE id = ? AND idUser = ?", [id, req.infoApikey.id])

        if(items.length == 0){
            database.disconnect();
            return res.status(400).json({ error: "is not your item" })
        }
        
        deletedBids = await database.query("DELETE FROM bids WHERE b.idItem=?",[id])
        deletedItem = await database.query("DELETE FROM items WHERE id=?", [id])
    } catch( e ){
        database.disconnect();
        return res.status(400).json({error: "error in deleting item"})
    }

    database.disconnect();
    res.json({deleted: true, deletedBids: deletedBids, deletedItem: deletedItem})
})

module.exports = routerItems