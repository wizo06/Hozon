const POST_DIV = 'ltEKP';
const IMG_CLASS = 'FFVAD';
const VID_CLASS = 'tWeCl';
const BUTTON_CLASS = '_6CZji';

const evalFunction = (IMG_CLASS, VID_CLASS, POST_DIV, postID, username) => {
  let temp = [];
  let imgCollection = document.getElementsByClassName(POST_DIV)[0].getElementsByClassName(IMG_CLASS);
  let videoCollection = document.getElementsByClassName(POST_DIV)[0].getElementsByClassName(VID_CLASS);

  if (imgCollection.length !== 0) {
    for (img of imgCollection) {
      const fileName = img.src.split('?')[0].split('/').pop();
      temp.push({
        username: username,
        mediaURL: img.src,
        fileName: `${postID}---${fileName}`,
        platform: `instagram`
      });
    }
  }

  if (videoCollection.length !== 0) {
    for (video of videoCollection) {
      const fileName = video.src.split('?')[0].split('/').pop();
      temp.push({
        username: username,
        mediaURL: video.src,
        fileName: `${postID}---${fileName}`,
        platform: `instagram`
      });
    }
  }

  return temp;
};

const createJobForMedia = (page, postURL, username) => {
  return new Promise(async (resolve, reject) => {
    await page.goto(postURL);
    await page.waitForTimeout(500);

    const urlSplit = postURL.split('/');
    const postID = urlSplit[urlSplit.length - 2];

    let result = await page.evaluate(evalFunction, IMG_CLASS, VID_CLASS, POST_DIV, postID, username);

    let nextButton = await page.evaluate(BUTTON_CLASS => {
      return document.getElementsByClassName(BUTTON_CLASS).length;
    }, BUTTON_CLASS);

    while (nextButton) {
      await page.click(`button.${BUTTON_CLASS}`);
      await page.waitForTimeout(200);

      let moreResult = await page.evaluate(evalFunction, IMG_CLASS, VID_CLASS, POST_DIV, postID, username);

      // Concat
      result = [...result, ...moreResult];

      nextButton = await page.evaluate(BUTTON_CLASS => {
        return document.getElementsByClassName(BUTTON_CLASS).length;
      }, BUTTON_CLASS);
    }

    // Dedupe
    result = [...new Set(result)];
    // console.log(`post has ${result.length} pictures`)
    resolve(result);
  });
};

module.exports = {
  createJobForMedia
}