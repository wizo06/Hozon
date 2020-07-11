const DIV_CLASS = 'artwork-image';

const createJobForMedia = (page, postURL, username) => {
  return new Promise(async (resolve, reject) => {
    await page.goto(postURL);

    let postID = postURL.split('/').pop();

    let result = await page.evaluate((DIV_CLASS, postID, username) => {
      let temp = [];
      let divCollection = document.getElementsByClassName(DIV_CLASS);

      if (divCollection.length !== 0) {
        for (div of divCollection) {
          const fileName = div.firstElementChild.children[3].src.split('/').pop().split('?')[0];
          temp.push({
            username: username,
            mediaURL: div.firstElementChild.children[3].src,
            fileName: `${postID}---${fileName}` 
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