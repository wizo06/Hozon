const POST_CLASS = 'project-image';

const scrollAndScrape = (page) => {
  return new Promise(async (resolve, reject) => {
    let scrapedPostsURLs = [];
    let currentHeight = 0;
    let newHeight = 1;

    while (newHeight > currentHeight) {
      // Scrape
      let result = await page.evaluate((POST_CLASS) => {
        let temp = [];
        let htmlCollection = document.getElementsByClassName(POST_CLASS);
        for (a of htmlCollection) {
          temp.push(a.href);
        }
        return temp;
      }, POST_CLASS);

      // Concat
      scrapedPostsURLs = [...scrapedPostsURLs, ...result];

      // Scroll
      currentHeight = await page.evaluate('document.body.scrollHeight');
      await page.evaluate(`window.scrollTo(0, ${currentHeight})`);
      await page.waitFor(2000);
      newHeight = await page.evaluate('document.body.scrollHeight');
    }

    // Dedupe
    scrapedPostsURLs = [...new Set(scrapedPostsURLs)];
    resolve(scrapedPostsURLs);
  });
};

module.exports = {
  scrollAndScrape
}