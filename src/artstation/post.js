const DIV_CLASS = 'artwork-image';

const createJobForMedia = (page, postURL, username) => {
  return new Promise(async (resolve, reject) => {
    await page.goto(postURL);
    await page.waitFor(1000);

    const urlSplit = postURL.split('/');
    const postID = urlSplit[urlSplit.length - 1];

    let result = await page.evaluate((DIV_CLASS, postID, username) => {
      let temp = [];
      let divCollection = document.getElementsByClassName(DIV_CLASS);

      if (divCollection.length !== 0) {
        for (div of divCollection) {
          const fileName = div.firstElementChild.children[3].src.split('/').pop().split('?')[0];
          temp.push({
            username: username,
            mediaURL: div.firstElementChild.children[3].src,
            fileName: `${postID}---${fileName}`,
            platform: `artstation`
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