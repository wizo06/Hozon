const amqp = require('amqplib')
const https = require('https')
const fs = require('fs')
const logger = require('logger')
const path = require('path')

const config = require('@iarna/toml').parse(fs.readFileSync('config/config.toml'))

const download = msg => {
  return new Promise((resolve, reject) => {
    const {
      userId,
      username,
      postId,
      mediaId,
      url,
      platform
    } = msg
  
    fs.mkdirSync(`archive/${platform}/${userId}(${username})/${postId}`, { recursive: true })
    const ext = path.extname(url)
    const file = fs.createWriteStream(`archive/${platform}/${userId}(${username})/${postId}/${mediaId}${ext}`)
    https.get(url, res => {
      res.pipe(file)
      resolve()
    })
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
        logger.info(job)

        await download(job)
        logger.success('Downloaded')

        await channel.ack(msg)
        logger.success('Ack')
      }
      catch (e) {
        logger.error(e)

        await channel.nack(msg, false, true)
        logger.error('Nack')
      }
    })
  }
  catch (e) {
    logger.error(e)
  }
})()
