const express = require('express')
const router = express.Router()
const mongo = require("../mongo.js")
const database = mongo.get().db("Posh").collection("tweets")

router.get("/", async (req, res) => {
  // let result  = await database.aggregate([
  //   // Group by the grouping key, but keep the valid values
  //   { "$group": {
  //       "_id": "$hiveUsername",
  //       "tokens": { $sum: "$tokens" },
  //   }},
  //   { "$sort": { "tokens": -1 } }
  // ]).toArray()

  let array = await database.find({}).toArray()
  let registeredUsers = await mongo.get().db("Posh").collection("users").find({}).toArray()

  array = await array.filter((obj) => {
    return obj.tokens != 'NULL' && !isNaN(obj.tokens) && obj.tokens != null
  })

  let sum = 0;
  array.forEach((obj) => {
    sum += parseFloat(obj.tokens)
  })

  var result = [];
  array.reduce(function(res, value) {
    if (!res[value.hiveUsername]) {
      res[value.hiveUsername] = { hiveUsername: value.hiveUsername, tokens: parseFloat(value.tokens) };
      result.push(res[value.hiveUsername])
    }
    res[value.hiveUsername].tokens += parseFloat(value.tokens);
    return res;
  }, {});

  result.sort((a, b) => {
    return b.tokens - a.tokens;
  })

  result.forEach((obj) => {
    obj.tokens = parseFloat(obj.tokens).toFixed(3)
  })

  result.forEach((obj) => {
    let twitterUsername = registeredUsers.find(o => o.hiveUsername == obj.hiveUsername);
    if (twitterUsername) obj['twitterUsername'] = twitterUsername.twitterUsername
  })

  res.json({
    sum: parseFloat(sum).toFixed(3),
    result: result
  })
})

module.exports = router;
