const express = require("express")
const database = require("../database")
const routerUsers = express.Router();

routerUsers.post("/", async (req,res) => {
    let email = req.body.email
    let password = req.body.password
    let errors = [];
    if( email==undefined){
        errors.push({error: "no email in body"})
    }
    if( password==undefined){
        errors.push({error: "no password in body"})
    }
    if(errors.length > 0){
        return res.status(400).json({errors: errors})
    }

    database.connect();
    let insertedUser;
    try{

        let userWithEmail = await database.query("SELECT email FROM users WHERE email = ?", [email])

        if(userWithEmail.length > 0) {
            database.disconnect();
            return res.status(400).json({error: "email already in use"})
        }
        insertedUser = await database.query(
            "INSERT INTO users (email, password) VALUES (?,?)"
        ,[email,password])
    } catch( e ){
        database.disconnect();
        return res.status(400).json({error: "problem while inserting the new user"})
    }

    database.disconnect();
    res.json({inserted: insertedUser})
    
})

module.exports = routerUsers