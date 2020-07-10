const puppeteer = require('puppeteer');
const profile = require('./profile.js');
const post = require('./post.js');
const download = require('./download.js');

(async (username) => {
  const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 800, height: 600 } });
  const page = await browser.newPage();
  await page.goto(`https://www.artstation.com/${username}`);

  // Step 1: Get posts URL
  const postsURL = await profile.scrollAndScrape(page);

  // Step 2: Get media URL
  let temp = [];
  for (url of postsURL) {
    let mediaURLwithPostID = await post.getMediaURLwithPostID(page, url);
    temp = [...temp, ...mediaURLwithPostID];
  }
  
  await browser.close();

  // Step 3: Download using curl
  for (url of temp) {
    await download.init(url);
  }
})('lucidsky')