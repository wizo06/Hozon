const { basename, extname } = require('path')
const fetch = require('node-fetch')
const fs = require('fs')
const logger = require('@wizo06/logger')
const rabbit = require('../helpers/rabbit.js')
const readline = require('readline')

;(async () => {
  try {
    const { connection, channel } = await rabbit.getChannel()
    
    const rl = readline.createInterface({
      input: fs.createReadStream('watchlist/pixiv.txt'),
      crlfDelay: Infinity
    })
  
    for await (const userId of rl) {  
      const res = await fetch(`https://www.pixiv.net/ajax/user/${userId}/profile/all`)
      const json = await res.json()

      const arrOfPostId = Object.keys(json.body.illusts)
      const normalizedPostIds = arrOfPostId.map(postId => `ids[]=${postId}`)
            
      const res2 = await fetch(`https://www.pixiv.net/ajax/user/${userId}/illusts?${normalizedPostIds.join('&')}`)
      const json2 = await res2.json()
  
      for (const postId of arrOfPostId) {
        const username = json2.body[postId].userName

        const originalLink = new URL(json2.body[postId].url)
        const splitUpPath = originalLink.pathname.split('/')
        const normalizedPath = splitUpPath.slice(3).join('/')
        const normalizedLink = `${originalLink.origin}/${normalizedPath}`
        
        const ext = extname(normalizedPath)
        const mediaId = basename(normalizedPath, ext)
        
        const message = {
          userId,
          username,
          postId,
          mediaId,
          ext,
          url: normalizedLink,
          platform: 'pixiv'
        }
        rabbit.publish({ message, channel })
        
        // One post can have more than one image. Each image is identified
        // with a number starting from 0. Probe the link by incrementing
        // the number until status 200 doesn't return anymore.
        let i = 1
        while (true) {
          const probeLink = normalizedLink.replace(/_p\d+_/i, `_p${i}_`)
          const res3 = await fetch(probeLink, { headers: { 'Referer': 'https://www.pixiv.net/' } })
          if (res3.status != 200) break 

          const mediaId = basename(probeLink, ext)

          const message = {
            userId,
            username,
            postId,
            mediaId,
            ext,
            url: probeLink,
            platform: 'pixiv'
          }
          rabbit.publish({ message, channel })
          i++
        }
      }
    }

    await rabbit.closeConnection({ connection, channel })
  }
  catch (e) {
    logger.error(e)
  }
})()
