const mongo = require("../mongo.js")
const database = mongo.get().db("Posh").collection("tweets")
const hive = require("@hiveio/hive-js")

/* objectOfData:
* tokensPerScore [int]
* tweetsToday [array]
*/

async function submit(objectOfData){
  let { tokensPerScore, tweetsToday } = objectOfData
  let today = getDate();
  let title = `Daily PoshToken statistic - ${today}`
  let body = `Today, we distributed ***${process.env.DAILY_TOKENS}*** tokens to ${tweetsToday.length} tweets.`
  body += `\n\n|Hive username|Tokens earned today|Tweet\n|---|---|---|\n`
  body += prepareTable(tweetsToday)
  body += `\n\n<center><h3>Top earners</h3>`
  body += `Visit [PoshToken Website](https://poshtoken.fbslo.net/users)`
  body += `\n\nThis project is supported by witness [@ocd-witness](https://hivesigner.com/sign/account-witness-vote?witness=ocd-witness&approve=1) and bot is developed by witness [@fbslo](https://hivesigner.com/sign/account-witness-vote?witness=fbslo&approve=1).`
  submitToHive(body, title)
}

function submitToHive(body, title){
  let permlink = new Date().getTime() + '-posh-bot'
  let jsonMetadata = { app: 'poshtoken/2.0', author: "fbslo" }
  hive.broadcast.comment(process.env.PRIVATE_KEY, '', 'poshtoken', process.env.ACCOUNT, permlink, title, body, jsonMetadata, function(err, result) {
    if (err) console.log(err)
    else console.log("Daily post submited.")
    //else addCommentOptions(permlink)
  });
}

function addCommentOptions(permlink){
  let extensions = [[0, {
    "beneficiaries": [
      {
        "account": "fbslo",
        "weight": 10000
      }
    ]
  }]]
  hive.broadcast.commentOptions(process.env.PRIVATE_KEY, process.env.ACCOUNT, permlink, '1000.000 HBD', 10000, true, true, extensions, function(err, result) {
    if (err) console.log(err)
  });
}

function prepareTable(tweetsToday){
  let body = ''
  for (i in tweetsToday){
    body += `|@${tweetsToday[i].hiveUsername}|${tweetsToday[i].tokens}|[Tweet](https://twitter.com/${tweetsToday[i].twitterUsername}/status/${tweetsToday[i].twitterTweetId})|\n`
  }
  console.log(body)
  return body;
}

function prepareRichlist(){
  return new Promise(async (resolve, reject) => {
    let result  = await database.aggregate([
      // Group by the grouping key, but keep the valid values
      { "$group": {
          "_id": "$hiveUsername",
          "tokens": { $sum: "$tokens" },
      }},
      { "$sort": { "tokens": -1 } }
    ]).toArray()
    result = result.slice(0, 25)
    if (result != null){
      let body = ''
      for (i in result){
        body += `|@${result[i]._id}|${result[i].tokens}|\n`
      }
      resolve(body)
    }
  })
}

function getDate(){
  let today = new Date();
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy = today.getFullYear();
  today = mm + '/' + dd + '/' + yyyy;
  return today;
}

module.exports.submit = submit
