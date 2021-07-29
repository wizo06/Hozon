const amqp = require('amqplib')
const fetch = require('node-fetch')
const fs = require('fs')
const logger = require('@wizo06/logger')

const config = require('@iarna/toml').parse(fs.readFileSync('config/config.toml'))

const download = msg => {
  return new Promise(async (resolve, reject) => {
    const {
      userId,
      username,
      postId,
      mediaId,
      ext,
      url,
      platform
    } = msg

    fs.mkdirSync(`archive/${platform}`, { recursive: true })
    const downloadPath = `archive/${platform}/${userId}(${username}) - ${postId} - ${mediaId}${ext}`
    const file = fs.createWriteStream(downloadPath)
    logger.info(`Downloading to: ${downloadPath}`)

    const opts = {}
    if (platform === 'pixiv') opts.headers = { 'Referer': 'https://www.pixiv.net/' }
    
    const res = await fetch(url, opts)
    res.body.pipe(file)
    res.body.on('end', () => resolve())
  })
}

;(async () => {
  try {
    const connection = await amqp.connect(config.rabbit)
    logger.success('Connection to RabbitMQ established')
    connection.on('close', (err) => { logger.error(`Connection close: ${err}`) })
    connection.on('error', (err) => { logger.error(`Connection error: ${err}`) })

    const channel = await connection.createChannel()
    logger.success('Channel created')
    channel.on('close', (err) => { logger.error(`Channel close: ${err}`) })
    channel.on('error', (err) => { logger.error(`Channel error: ${err}`) })

    await channel.prefetch(config.rabbit.prefetch)

    await channel.checkQueue(config.rabbit.queue)
    logger.success('Queue confirmed')

    await channel.consume(config.rabbit.queue, async msg => {
      try {
        const job = JSON.parse(msg.content)
        logger.success(`Received new job`)

        await download(job)
        logger.success('Downloaded')

        await channel.ack(msg)
        logger.success(`Ack'ed`)
      }
      catch (e) {
        logger.error(e)

        await channel.nack(msg, false, true)
        logger.error(`Nack'ed`)
      }
    })
  }
  catch (e) {
    logger.error(e)
  }
})()
