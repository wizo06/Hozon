const puppeteer = require('puppeteer');
const readline = require('readline');
const logger = require('logger');
const fs = require('fs');
const path = require('path');
const progress = require('progress');

const profile = require(path.join(process.cwd(), 'src/instagram/profile.js'));
const post = require(path.join(process.cwd(), 'src/instagram/post.js'));
const download = require(path.join(process.cwd(), 'src/shared/download.js'));

const isPrivate = (page) => {
  return new Promise(async (resolve, reject) => {
    let result = await page.evaluate('window._sharedData.entry_data.ProfilePage[0].graphql.user.is_private');
    resolve(result);
  });
};

const arrOfUsernames = [];
readline.createInterface({
  input: fs.createReadStream(path.join(process.cwd(), 'watchlist/instagram_usernames.txt'))
})
.on('line', username => {
  arrOfUsernames.push(username);
})
.on('close', async () => {
  let arrOfJobs = [];

  const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 800, height: 1440 } });
  const page = await browser.newPage();

  // Iterate over all usernames
  for (username of arrOfUsernames) {
    logger.info(`[Current username: ${username}] Processing...`);

    // Step 1: Create directory for downloads
    fs.mkdirSync(path.join(process.cwd(), `archives/instagram/${username}`), { recursive: true });

    await page.goto(`https://www.instagram.com/${username}`);
    await page.waitForTimeout(1000);

    // SKip current username if profile is private
    if (await isPrivate(page)) continue;

    // Step 2: Get posts URL
    logger.info(`[Current username: ${username}] Extracting posts URL...`);
    const arrOfpostsURL = await profile.scrollAndScrape(page);

    // Iterate over all posts URL
    logger.info(`[Current username: ${username}] Creating job for each media in each post...`);
    const postBar = new progress(':current/:total', { total: arrOfpostsURL.length });
    for (postURL of arrOfpostsURL) {
      // Step 3: Create a job for each media
      let job = await post.createJobForMedia(page, postURL, username);
      arrOfJobs = [...arrOfJobs, ...job];
      postBar.tick();
    }
  }
  // Step 4: Close browser once all usernames have been processed
  logger.info(`Closing puppeteer...`);
  await browser.close();

  const jobBar = new progress(':current/:total', { total: arrOfJobs.length });
  // Iterate over all jobs
  logger.info(`Downloading media...`);
  for (job of arrOfJobs) {
    // Step 5: Feed the job into the downloader module
    await download.curl(job);
    jobBar.tick();
  }
});
