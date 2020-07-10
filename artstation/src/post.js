const DIV_CLASS = 'artwork-image';

const getMediaURLwithPostID = (page, url) => {
  return new Promise(async (resolve, reject) => {
    await page.goto(url);

    let urlSplit = url.split('/');
    let postID = urlSplit.pop();
    if (postID === '') postID = urlSplit.pop();

    let result = await page.evaluate((DIV_CLASS, postID) => {
      let temp = [];
      let divCollection = document.getElementsByClassName(DIV_CLASS);

      if (divCollection.length !== 0) {
        for (div of divCollection) {
          temp.push({
            postID: postID,
            url: div.firstElementChild.children[3].src
          });
        }
      }

      return temp;
    }, DIV_CLASS, postID);

    // Dedupe
    result = [...new Set(result)];

    resolve(result);
  });
};

module.exports = {
  getMediaURLwithPostID
}