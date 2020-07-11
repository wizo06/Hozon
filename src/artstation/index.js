const puppeteer = require('puppeteer');
const readline = require('readline');
const logger = require('logger');
const fs = require('fs');
const path = require('path');

const profile = require(path.join(process.cwd(), 'src/artstation/profile.js'));
const post = require(path.join(process.cwd(), 'src/artstation/post.js'));
const download = require(path.join(process.cwd(), 'src/shared/download.js'));

const arrOfUsernames = [];
readline.createInterface({
  input: fs.createReadStream(path.join(process.cwd(), 'watchlist/artstation_usernames.txt'))
})
.on('line', username => {
  arrOfUsernames.push(username);
})
.on('close', async () => {
  let arrOfJobs = [];

  const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 800, height: 600 } });
  const page = await browser.newPage();
  
  // Iterate over all usernames
  for (username of arrOfUsernames) {
    logger.info(`[Current profile: ${username}] Processing...`);

    // Step 1: Create directory for downloads
    fs.mkdirSync(path.join(process.cwd(), `archives/${username}`), { recursive: true });
    
    await page.goto(`https://www.artstation.com/${username}`);

    // Step 1: Get posts URL
    logger.info(`[Current profile: ${username}] Extracting posts URL...`);
    const arrOfpostsURL = await profile.scrollAndScrape(page);

    // Iterate over all posts URL
    logger.info(`[Current profile: ${username}] Creating job for each media in each post...`);
    for (postURL of arrOfpostsURL) {
      // Step 2: Create a job for each media
      let job = await post.createJobForMedia(page, postURL, username);
      arrOfJobs = [...arrOfJobs, ...job];
    }
  }
  // Step 3: Close browser once all usernames have been processed
  logger.info(`Closing puppeteer...`);
  await browser.close();

  // Iterate over all jobs
  logger.info(`Downloading media...`);
  for (job of arrOfJobs) {
    // Step 4: Feed the job into the downloader module
    await download.handleJob(job);
  }
});
