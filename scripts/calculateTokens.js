const mongo = require("../mongo.js")
const database = mongo.get().db("Posh").collection("tweets")

function calculate(){
  return new Promise((resolve, reject) => {
    database.find({engagementTime: {$gt: new Date().getTime() - 86400000}, tokens: 'NULL', engagementScore: { $ne: "NULL" }}, async (err, result) => { //find all tweets that received engagementScore in last day
      if (err) console.log(`Error calculating tokens! Database error: ${err}`)
      else {
        result = await result.toArray()
        if (result == null) console.log(`No new tweets to calculate tokens for.`)
        else {
          let totalEngagementScoreToday = 0
          for (i in result){
            totalEngagementScoreToday += result[i].engagementScore
          }
          let totalDailyAmountOfTokens = process.env.DAILY_TOKENS
          let tokensPerScore = totalDailyAmountOfTokens / totalEngagementScoreToday
          for (i in result){
            updateTweetTokens(result[i].twitterTweetId, parseFloat(tokensPerScore * result[i].engagementScore).toFixed(3))
            result[i].tokens = parseFloat(tokensPerScore * result[i].engagementScore).toFixed(3)
            if (i == result.length - 1) resolve({
              tokensPerScore: tokensPerScore,
              tweetsToday: result,
            })
          }
        }
      }
    })
  })
}

function updateTweetTokens(twitterTweetId, tokens){
  console.log(`Tweet ${twitterTweetId} got ${tokens} tokens.`)
  database.updateOne({twitterTweetId: twitterTweetId}, {
    $set: {
      tokensTime: new Date().getTime(),
      tokens: tokens
    }
  }, (err, result) => {
    if (err) console.log(`Error storing tokens for tweet ${twitterTweetId}.`)
    else console.log(`Tweet ${twitterTweetId} stored!`)
  })
}

module.exports.calculate = calculate
