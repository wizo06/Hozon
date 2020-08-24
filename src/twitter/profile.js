const POST_TAG = 'article';

const scrollAndCreateJob = (page, username) => {
  return new Promise(async (resolve, reject) => {
    let arrOfJobs = {
      img: [],
      video: []
    };
    let currentHeight = 0;
    let newHeight = 1;

    while (newHeight > currentHeight) {
      // Scrape
      let result = await page.evaluate((POST_TAG, username) => {
        let temp = {
          img: [],
          video: []
        };

        let articleCollection = document.getElementsByTagName(POST_TAG);
        for (article of articleCollection) {
          const tweetURL = article.getElementsByTagName('a')[2].href;
          const postID = tweetURL.split('/').pop();

          let imgCollection = article.querySelectorAll('img[alt="Image"]');
          for (img of imgCollection) {
            const ext = img.src.match(/format=([^&])*/g)[0].split('=').pop();
            const fileName = `${img.src.replace(/&name=.*/, '').split('/').pop().split('?')[0]}.${ext}`;
            temp.img.push({
              username: username,
              mediaURL: img.src,
              fileName: `${postID}---${fileName}`,
              platform: `twitter`
            });
          }

          // If current article does not have any image, then assume it has a video
          if (imgCollection.length === 0) {
            temp.video.push({
              username: username,
              mediaURL: tweetURL,
              platform: `twitter`
            });
          }
        }
        return temp;
      }, POST_TAG, username);

      // Concat
      arrOfJobs.img = [...arrOfJobs.img, ...result.img];
      arrOfJobs.video = [...arrOfJobs.video, ...result.video];
      
      // Scroll
      currentHeight = await page.evaluate('document.body.scrollHeight');
      await page.evaluate(`window.scrollTo(0, ${currentHeight})`);
      await page.waitFor(1000);
      newHeight = await page.evaluate('document.body.scrollHeight');
    }
    
    // Dedupe
    arrOfJobs.img = [...new Set(arrOfJobs.img)];
    arrOfJobs.video = [...new Set(arrOfJobs.video)];

    resolve(arrOfJobs);
  });
};

module.exports = {
  scrollAndCreateJob
}