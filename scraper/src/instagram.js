const { basename, extname } = require('path')
const cheerio = require('cheerio')
const fetch = require('node-fetch')
const fs = require('fs')
const logger = require('@wizo06/logger')
const rabbit = require('../helpers/rabbit.js')
const readline = require('readline')

const config = require('@iarna/toml').parse(fs.readFileSync('config/config.toml'))

/**
 * Parse window._sharedData to retrieve userId of a given username
 */
const getUserIdByUsername = (username) => {
  return new Promise(async (resolve, reject) => {
    try {
      logger.info(`Retrieving userId for ${username}`)
      const options = {
        headers: {
          'Cookie': config.instagram.cookie
        }
      }
      const res = await fetch(`https://www.instagram.com/${username}`, options)
      const body = await res.text()
      const $ = cheerio.load(body)
      
      $('script').each(function (i, elem) {
        if ($(this)['0'].children[0]?.data.startsWith('window._sharedData')) {
          const data = $(this)['0'].children[0]?.data
          const dataObj = data.replace(/(^window\._sharedData\s*=\s*)|(;$)/gi, '')
          const json = JSON.parse(dataObj)
          if (json.entry_data.HttpErrorPage) return resolve(null)
          resolve(json.entry_data.ProfilePage[0]?.graphql?.user?.id)
        }
      })    
    }
    catch (e) {
      logger.error(e)
    }
  })
}

/**
 * Query the API to retrieve the url of media and then
 * send a message to RabbitMQ. This function will recurisvely call itself
 * until next page is false.
 */
const fetchAndSend = async (myUrl, opts, userId, username, channel) => {
  try {
    const res = await fetch(myUrl.href, opts)
    const body = await res.json()

    const end_cursor = body.data.user.edge_owner_to_timeline_media.page_info.end_cursor
    const has_next_page = body.data.user.edge_owner_to_timeline_media.page_info.has_next_page
    const edges = body.data.user.edge_owner_to_timeline_media.edges

    // If there are 0 edges, that means the profile is private and cannot
    // be accessed with the provided cookie session.
    if (edges.length === 0) logger.warning('Profile is private. Cannot be accessed.')

    for (const edge of edges) {
      const postId = edge.node.shortcode
      const childEdges = edge.node.edge_sidecar_to_children?.edges
      // Post has multiple images
      if (childEdges) {
        for (const childEdge of childEdges) {
          const mediaLink = new URL(childEdge.node.display_url)
          const ext = extname(mediaLink.pathname)
          const mediaId = basename(mediaLink.pathname, ext)
  
          const message = { 
            userId, 
            username, 
            postId, 
            mediaId, 
            ext,
            url: mediaLink.href, 
            platform: 'instagram', 
          }
          rabbit.publish({ message, channel })
        }        
      }
      // Post has single image
      else {
        const mediaLink = new URL(edge.node.display_url)
        const ext = extname(mediaLink.pathname)
        const mediaId = basename(mediaLink.pathname, ext)

        const message = { 
          userId, 
          username, 
          postId, 
          mediaId, 
          ext,
          url: mediaLink.href, 
          platform: 'instagram', 
        }
        rabbit.publish({ message, channel })
      }
    }

    if (has_next_page) {
      myUrl.searchParams.set('variables', `{"id":"${userId}","first":12,"after":"${end_cursor}"}`)
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
      input: fs.createReadStream('watchlist/instagram.txt'),
      crlfDelay: Infinity
    })
  
    for await (const username of rl) {
      const userId = await getUserIdByUsername(username)
      
      if (userId === null) {
        logger.warning('Profile does not exist')
        continue
      }

      const myUrl = new URL(`https://www.instagram.com/graphql/query/`)
      myUrl.searchParams.set('query_hash', '8c2a529969ee035a5063f2fc8602a0fd')
      myUrl.searchParams.set('variables', `{"id":"${userId}","first":12}`)
      
      const opts = {
        headers: { 'Cookie': config.instagram.cookie }
      }

      await fetchAndSend(myUrl, opts, userId, username, channel)
    }

    await rabbit.closeConnection({ connection, channel })
  }
  catch (e) {
    logger.error(e)
  }
})()