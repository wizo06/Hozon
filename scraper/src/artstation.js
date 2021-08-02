const { basename, extname } = require('path')
const cheerio = require('cheerio')
const fetch = require('node-fetch')
const fs = require('fs')
const logger = require('@wizo06/logger')
const rabbit = require('../helpers/rabbit.js')
const readline = require('readline')

const fetchAndSend = async (url, username, channel) => {
  try {
    const res = await fetch(url.href)

    if (res.status != 200) {
      logger.warning('Profile does not exist')
      return Promise.resolve()
    }

    const json = await res.json()
    const userId = json.data[0].user_id

    for (const data of json.data) {
      const res = await fetch(`https://${username}.artstation.com/projects/${data.hash_id}`)
      const body = await res.text()
      const $ = cheerio.load(body)
      $('div.project-page').find('a.colorbox-gal').each(function (i, elem) {
        const originalLink = new URL($(this).attr('href'))
        const ext = extname(originalLink.pathname)
        const mediaId = basename(originalLink.pathname, ext)

        const message = {
          userId,
          username,
          postId: data.hash_id,
          mediaId,
          ext,
          url: originalLink.href,
          platform: 'artstation'
        }
        rabbit.publish({ message, channel })
      })
    }

    const currentPage = parseInt(url.searchParams.get('page'))
    const accumulatedCount = (currentPage-1)*50 + json.data.length

    if (accumulatedCount < json.total_count) {
      url.searchParams.set('page', currentPage + 1)

      await fetchAndSend(url, username, channel)
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
      input: fs.createReadStream('watchlist/artstation.txt'),
      crlfDelay: Infinity
    })
  
    for await (const username of rl) {
      logger.info(`Retrieving posts for ${username}`)
      const url = new URL(`https://www.artstation.com/users/${username}/projects.json`)
      url.searchParams.set('page', 1)
    
      await fetchAndSend(url, username, channel)    
    }

    await rabbit.closeConnection({ connection, channel })
  }
  catch (e) {
    console.error(e)
  }
})()