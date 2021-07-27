const amqp = require('amqplib')
const logger = require('@wizo06/logger')

const config = require('@iarna/toml').parse(fs.readFileSync('config/config.toml'))

;(async () => {
  try {
    const connection = await amqp.connect(config.rabbit)
    logger.success('Connection established')

    const channel = await connection.createChannel()
    logger.success('Channel created')

    const exchangeOpts = {
      durable: true,
      internal: false,
      autoDelete: false,
    }
    await channel.assertExchange(config.rabbit.exchange, 'direct', exchangeOpts)
    logger.success('Exchange created')

    const queueOpts = {
      exclusive: false,
      durable: true,
      autoDelete: false,
    }
    await channel.assertQueue(config.rabbit.queue, queueOpts)
    logger.success('Queue created')

    await channel.bindQueue(config.rabbit.queue, config.rabbit.exchange, config.rabbit.routingKey)
    logger.success('Binding established')

    await channel.close()
    logger.success('Channel closed')

    await connection.close()
    logger.success('Connection closed')
  }
  catch (e) {
    console.log(e)
  }
})()