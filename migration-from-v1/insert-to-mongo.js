const mongo = require("../mongo.js")
const fs = require("fs")
require("dotenv").config()
console.log(process.env.MONGO)
mongo.connect()
  .then(() => main())
  .catch(err => console.log(err))

function main(){
  //users()
  tokens()
  //db_delete()
}

function users(){
  fs.readFile("./users.txt", (err, result) => {
    if (err) console.log(err)
    else {
      const database = mongo.get().db("Posh").collection("users")
      let users = JSON.parse(result)
      database.insertMany(users, (err, result) => {
        console.log(err, result)
      })
    }
  })
}

function tokens(){
  fs.readFile("./tokens.txt", (err, result) => {
    if (err) console.log(err)
    else {
      const database = mongo.get().db("Posh").collection("tweets")
      let tweets = JSON.parse(result)
      database.insertMany(tweets, (err, result) => {
        console.log(err, result)
      })
    }
  })
}

function db_delete(){
  const database = mongo.get().db("Posh").collection("tweets")
  database.deleteMany({"hiveLink": "v1-legacy"}, (err, result) => {
    console.log(err, result)
  })
}
