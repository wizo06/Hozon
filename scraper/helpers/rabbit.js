const amqp = require('amqplib')
const fs = require('fs')
const logger = require('@wizo06/logger')

const config = require('@iarna/toml').parse(fs.readFileSync('config/config.toml'))

const getChannel = async () => {
  const connection = await amqp.connect(config.rabbit)
  logger.success('Connection to RabbitMQ established')
  
  const channel = await connection.createChannel()
  logger.success('Channel created')
  
  await channel.checkExchange(config.rabbit.exchange)
  logger.success(`Exchange confirmed`)

  return Promise.resolve({ connection, channel })
}

const closeConnection = async ({ connection, channel }) => {
  await channel.close()
  logger.success('Channel closed')

  await connection.close()
  logger.success('Connection to RabbitMQ closed')
  return Promise.resolve()
}

const publish = ({ message, channel }) => {
  const { userId, username, postId, mediaId, ext, platform } = message
  const separator = `${logger.color.magenta}-${logger.format.reset}`
  logger.info(`Publishing: ${platform} ${separator} ${userId}(${username}) ${separator} ${postId} ${separator} ${mediaId}${ext}`)
  
  channel.publish(
    config.rabbit.exchange,
    config.rabbit.routingKey,
    Buffer.from(JSON.stringify(message)),
    { persistent: true }
  )
}

module.exports = {
  getChannel,
  closeConnection,
  publish
}