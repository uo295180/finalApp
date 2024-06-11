const express = require("express")
const jwt = require("jsonwebtoken")
let activeApiKeys = require("./activeApiKeys")
const app = express();
const port = 3000;
app.use(express.json())

let routerUsers = require("./routers/routerUsers")
let routerItems = require("./routers/routerItems")
let routerBids = require("./routers/routerBids")

app.use(["/items","/bids"], (req, res, next) => {
    console.log("middleware execution")

    let apiKey = req.query.apiKey;
    if( apiKey == undefined ){
        return res.status(401).json({ error: "no apiKey" })
    }
    let infoApiKey;
    try{
        infoApiKey = jwt.verify(apiKey,"secret")
    } catch ( e ) {
        return res.status(401).json({ error: "invalid apiKey" })
    }
    if( infoApiKey == undefined || activeApiKeys.indexOf(apiKey) == -1){
        return res.status(401).json({ error: "invalid apiKey" })
    }

    req.infoApiKey = infoApiKey;
    next();
})

app.use("/users",routerUsers)
app.use("/items",routerItems)
app.use("/bids",routerBids)



app.listen(port, () => {
    console.log("Final app listening on port " + port)
})