const amqp = require('amqplib')
const fetch = require('node-fetch')
const fs = require('fs')
const logger = require('logger')
const readline = require('readline')

const config = require('@iarna/toml').parse(fs.readFileSync('config/config.toml'))

/**
 * Hit Twitter's v2 API endpoint to retrieve the userId of a given username
 */
const getUserIdByUsername = (username) => {
  return new Promise(async (resolve, reject) => {
    try {
      logger.info(`Retrieving userId for ${username}`)
      const opts = {
        headers: { 'Authorization': `Bearer ${config.api.twitter.bearer}` }
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
 * Hit Twitter's v2 API endpoint to retrieve the url of media and then
 * send a message to RabbitMQ. This is a recursive function that will call itself
 * if there is pagination in the API response.
 */
const fetchAndSend = async (myUrl, opts, nextPageToken, userId, username, channel) => {
  try {
    if (nextPageToken) myUrl.searchParams.set('pagination_token', nextPageToken)

    const res = await fetch(myUrl.href, opts)
    const json = await res.json()
    
    if (json.errors) return logger.error(json.errors)
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
          const message = {
            userId,
            username,
            postId: tweet.id,
            mediaId,
            url: keyUrlPair[mediaId],
            platform: 'twitter'
          }
          logger.info(`${userId}(${username})/${tweet.id}/${mediaId} ${keyUrlPair[mediaId]}`)
          channel.publish(
            config.rabbit.exchange,
            config.rabbit.routingKey,
            Buffer.from(JSON.stringify(message)),
            { persistent: true }
          )
        }
      }
    }

    if (json.meta?.next_token) {
      await fetchAndSend(myUrl, opts, json.meta?.next_token, userId, username, channel)
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
    const connection = await amqp.connect(config.rabbit)
    logger.success('Connection to RabbitMQ established')
    
    const channel = await connection.createChannel()
    logger.success('Channel created')

    await channel.checkExchange(config.rabbit.exchange)
    logger.success(`Exchange confirmed`)

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
        headers: { 'Authorization': `Bearer ${config.api.twitter.bearer}` }
      }
  
      await fetchAndSend(myUrl, opts, null, userId, username, channel)
    }

    await channel.close()
    logger.success('Channel closed')

    await connection.close()
    logger.success('Connection to RabbitMQ closed')
  }
  catch (e) {
    logger.error(e)
  }
})()
