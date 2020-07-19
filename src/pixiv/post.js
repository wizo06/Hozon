const DIV_CLASS = 'sc-1qpw8k9-1 fvHoJ';
const SEE_ALL_CLASS = 'emr523-0';

const createJobForMedia = (page, postURL, username) => {
  return new Promise(async (resolve, reject) => {
    await page.goto(postURL);
    await page.waitFor(1000);

    const urlSplit = postURL.split('/');
    const postID = urlSplit[urlSplit.length - 1];
    
    await page.evaluate(SEE_ALL_CLASS => {
      // Click "See All"
      const seeAllButton = document.getElementsByClassName(SEE_ALL_CLASS)[0];
      if (seeAllButton) seeAllButton.click();
    }, SEE_ALL_CLASS);
    await page.waitFor(1000);

    let result = await page.evaluate((DIV_CLASS, postID, username) => {
      let temp = [];
      let divCollection = document.getElementsByClassName(DIV_CLASS);

      if (divCollection.length !== 0) {
        for (div of divCollection) {
          const fileName = div.src.split('/').pop();
          temp.push({
            username: username,
            mediaURL: div.src,
            fileName: `${postID}---${fileName}`,
            platform: `pixiv`
          });
        }
      }

      return temp;
    }, DIV_CLASS, postID, username);

    // Dedupe
    result = [...new Set(result)];

    resolve(result);
  });
};

module.exports = {
  createJobForMedia
}