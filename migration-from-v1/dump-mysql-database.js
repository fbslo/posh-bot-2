const con = require('../database.js')
var fs = require('fs')

function users(){
  con.query("SELECT * FROM users", (err, result) => {
    if (err) console.log(err)
    else {
      let users = []
      for (i in result){
        users.push({
          twitterUsername: result[i].twitter,
          twitterTweetId: "v1-legacy",
          hiveUsername: result[i].hive,
          timestamp: result[i].time
        })
      }
      users = JSON.stringify(users)
      fs.appendFile('users.txt', users, function (err) {
        if (err) console.log(err)
        else console.log("Done :)")
     })
   }
  })
}

function tokens(){
  con.query("SELECT hive_username, SUM(points) AS sum FROM twitter_posts GROUP BY hive_username;", (err, result) => {
    if (err) console.log(err)
    else {
      let users = []
      for (i in result){
        users.push({
          twitterTweetId: "v1-legacy",
          twitterUsername: "v1-legacy",
          hiveUsername: "v1-legacy",
          hiveLink: "v1-legacy",
          timestamp: 0,
          created: "v1-legacy",
          engagementScore: "v1-legacy",
          engagementTime: "v1-legacy",
          tokens: result[i].sum,
          tokensTime: "v1-legacy
        })
      }
      users = JSON.stringify(users)
      fs.appendFile('tokens.txt', users, function (err) {
        if (err) console.log(err)
        else console.log("Done :)")
     })
   }
  })
}
