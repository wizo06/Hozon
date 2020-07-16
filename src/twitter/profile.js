const POST_TAG = 'article';

const scrollAndCreateJob = (page, username) => {
  return new Promise(async (resolve, reject) => {
    let arrOfJobs = [];
    let currentHeight = 0;
    let newHeight = 1;

    while (newHeight > currentHeight) {
      // Scrape
      let result = await page.evaluate((POST_TAG, username) => {
        let temp = [];
        let articleCollection = document.getElementsByTagName(POST_TAG);
        for (article of articleCollection) {
          const postID = article.getElementsByTagName('a')[2].href.split('/').pop();
          let imgCollection = article.querySelectorAll('img[alt="Image"]');
          for (img of imgCollection) {
            const ext = img.src.match(/format=([^&])*/g)[0].split('=').pop();
            const fileName = `${img.src.replace(/&name=.*/, '').split('/').pop().split('?')[0]}.${ext}`;
            temp.push({
              username: username,
              mediaURL: img.src,
              fileName: `${postID}---${fileName}`,
              platform: `twitter`
            });
          }
        }
        return temp;
      }, POST_TAG, username);

      // Concat
      arrOfJobs = [...arrOfJobs, ...result];

      // Scroll
      currentHeight = await page.evaluate('document.body.scrollHeight');
      await page.evaluate(`window.scrollTo(0, ${currentHeight})`);
      await page.waitFor(1000);
      newHeight = await page.evaluate('document.body.scrollHeight');
    }

    // Dedupe
    console.log(arrOfJobs.length)
    arrOfJobs = [...new Set(arrOfJobs)];
    console.log(arrOfJobs.length)
    resolve(arrOfJobs);
  });
};

module.exports = {
  scrollAndCreateJob
}