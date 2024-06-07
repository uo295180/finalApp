const express = require("express")

const app = express();
const port = 3000;
app.use(express.json())

let routerUsers = require("./routers/routerUsers")
let routerItems = require("./routers/routerItems")
let routerBids = require("./routers/routerBids")

app.use("/users",routerUsers)
app.use("/items",routerItems)
app.use("/bids",routerBids)



app.listen(port, () => {
    console.log("Final app listening on port " + port)
})