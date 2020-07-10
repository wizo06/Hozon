const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const init = (job, username) => {
  return new Promise((resolve, reject) => {
    const fileName = `${job.postID}---${job.url.split('/').pop().split('?')[0]}`;
    const downloadDir = path.join(__dirname, `../archives/${username}`);
    let file = fs.createWriteStream(path.join(downloadDir, fileName));
    
    const curl = spawn('curl', [job.url]);
    curl.stdout.on('data', data => { file.write(data) });
    curl.stdout.on('end', () => { file.end() });
    curl.on('exit', code => { resolve() });
  })
}

module.exports = {
  init
}