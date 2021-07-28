const fetch = require('node-fetch')
const fs = require('fs')
const logger = require('@wizo06/logger')
const rabbit = require('../helpers/rabbit.js')
const readline = require('readline')

const config = require('@iarna/toml').parse(fs.readFileSync('config/config.toml'))

/**
 * Query the API to retrieve the userId of a given username
 */
const getUserIdByUsername = (username) => {
  return new Promise(async (resolve, reject) => {
    try {
      logger.info(`Retrieving userId for ${username}`)
      const opts = {
        headers: { 'Authorization': `Bearer ${config.twitter.bearer}` }
      }
      const res = await fetch(`https://api.twitter.com/2/users/by/username/${username}`, opts)
      const json = await res.json()
      if (json.errors) return reject(json)
      resolve(json.data?.id)
    }
    catch (e) {
      logger.error(e)
    }
  })
}

/**
 * Query the API to retrieve the url of media and then
 * send a message to RabbitMQ. This function will recursively call itself
 * until next page is false.
 */
const fetchAndSend = async (myUrl, opts, userId, username, channel) => {
  try {
    const res = await fetch(myUrl.href, opts)
    const json = await res.json()

    if (json.errors) return logger.error(json.errors)
    if (json.status === 401) return logger.error(json)
    if (json.includes) {
      const keyUrlPair = {}
      const media = json.includes.media.filter(x => x.type === 'photo')
      for (const medium of media) {
        keyUrlPair[medium.media_key] = medium.url
      }
  
      const tweets = json.data.filter(x => x.attachments)
      for (const tweet of tweets) {
        for (const mediaId of tweet.attachments.media_keys) {
          if (!keyUrlPair[mediaId]) continue

          rabbit.publish({ 
            userId, 
            username, 
            postId: tweet.id, 
            mediaId, 
            url: keyUrlPair[mediaId], 
            platform: 'twitter', 
            channel 
          })
        }
      }
    }

    if (json.meta?.next_token) {
      myUrl.searchParams.set('pagination_token', json.meta?.next_token)
      await fetchAndSend(myUrl, opts, userId, username, channel)
    }
    else {
      return Promise.resolve()
    }
  }
  catch (e) {
    logger.error(e)
  }
}

;(async () => {
  try {
    const { connection, channel } = await rabbit.getChannel()

    const rl = readline.createInterface({
      input: fs.createReadStream('watchlist/twitter.txt'),
      crlfDelay: Infinity
    })

    for await (const username of rl) {
      const userId = await getUserIdByUsername(username)
  
      const myUrl = new URL(`https://api.twitter.com/2/users/${userId}/tweets`)
      myUrl.searchParams.set('max_results', '100')
      myUrl.searchParams.set('exclude', 'retweets')
      myUrl.searchParams.set('expansions', 'attachments.media_keys')
      myUrl.searchParams.set('media.fields', 'url')

      const opts = {
        headers: { 'Authorization': `Bearer ${config.twitter.bearer}` }
      }
  
      await fetchAndSend(myUrl, opts, userId, username, channel)
    }

    await rabbit.closeConnection({ connection, channel })
  }
  catch (e) {
    logger.error(e)
  }
})()
