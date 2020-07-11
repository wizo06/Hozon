const puppeteer = require('puppeteer');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const profile = require('./profile.js');
const post = require('./post.js');
const download = require('./download.js');

const isPrivate = (page) => {
  return new Promise(async (resolve, reject) => {
    let result = await page.evaluate(() => {
      return window._sharedData.entry_data.ProfilePage[0].graphql.user.is_private;
    });
    resolve(result);
  });
};

const arrOfUsernames = [];
readline.createInterface({
  input: fs.createReadStream(path.join(__dirname, '../usernames.txt'))
})
.on('line', username => {
  arrOfUsernames.push(username);
})
.on('close', async () => {
  for (username of arrOfUsernames) {
    fs.mkdirSync(path.join(__dirname, `../archives/${username}`), { recursive: true });

    const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 800, height: 600 } });
    const page = await browser.newPage();
    await page.goto(`https://www.instagram.com/${username}`);

    if (await isPrivate(page)) {
      console.log(`${username} is private`);
    }
    else {
      console.log(`${username} is public`);
      // Step 1: Get posts URL
      const postsURL = await profile.scrollAndScrape(page);

      // Step 2: Get media URL
      let temp = [];
      for (url of postsURL) {
        let mediaURLwithPostID = await post.getMediaURLwithPostID(page, url);
        temp = [...temp, ...mediaURLwithPostID];
      }
    }

    await browser.close();

    // Step 3: Download using curl
    for (job of temp) {
      await download.init(job, username);
    }
  }
});

