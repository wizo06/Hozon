const POST_CLASS = '_1Ed7xkM';
const NEXT_CLASS = '_2m8qrc7';
const NEXT_HIDDEN_CLASS = '_3-MMeus';

const scrollAndScrape = (page) => {
  return new Promise(async (resolve, reject) => {
    let scrapedPostsURLs = [];
    let notInLastPage = true;

    while (notInLastPage) {
      // Scrape
      let result = await page.evaluate((POST_CLASS) => {
        let temp = [];
        let htmlCollection = document.getElementsByClassName(POST_CLASS);
        for (li of htmlCollection) {
          temp.push(li.getElementsByTagName('a')[0].href);
        }
        return temp;
      }, POST_CLASS);

      // Concat
      scrapedPostsURLs = [...scrapedPostsURLs, ...result];

      // Check if current page is last page
      const currentPageIsLastPage = await page.evaluate((NEXT_CLASS, NEXT_HIDDEN_CLASS) => {
        const buttonCollection = document.getElementsByClassName(NEXT_CLASS);
        const lastButton = buttonCollection[buttonCollection.length - 1];
        return lastButton.className.includes(NEXT_HIDDEN_CLASS);
      }, NEXT_CLASS, NEXT_HIDDEN_CLASS);

      if (currentPageIsLastPage) {
        // Exit while loop
        notInLastPage = false;
      }
      else {
        // Extract next page button
        const nextPageButtonHandle = await page.evaluateHandle((NEXT_CLASS) => {
          const buttonCollection = document.getElementsByClassName(NEXT_CLASS);
          return lastButton = buttonCollection[buttonCollection.length - 1];
        }, NEXT_CLASS);

        // Click on button
        await nextPageButtonHandle.click();
        await page.waitForTimeout(1000);
      }
    }

    // Dedupe
    scrapedPostsURLs = [...new Set(scrapedPostsURLs)];
    resolve(scrapedPostsURLs);
  });
};

module.exports = {
  scrollAndScrape
}