const readline = require('readline');
const fs = require('fs');
const path = require('path');

const download = require(path.join(process.cwd(), 'src/shared/download.js'));

readline.createInterface({
  input: fs.createReadStream(path.join(process.cwd(), 'watchlist/youtube_usernames.txt'))
})
.on('line', async channel => {
  await download.youtube_dl({ platform: 'youtube', mediaURL: channel });
});