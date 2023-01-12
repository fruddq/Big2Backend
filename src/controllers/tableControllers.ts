import express from "express"
const app = express()

//create

//READ/hämta tabledata
app.get("/v1/tables/:tableID", (_req, res) => {
  console.log(_req.params)
  res.send({
    availableTables: [1, 2, 3, 4],
  })
})

//update

//delete
