const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const handleJob = (job) => {
  return new Promise((resolve, reject) => {
    const username = job.username;
    const mediaURL = job.mediaURL;
    const fileName = job.fileName;

    const downloadDir = path.join(process.cwd(), `archives/${username}`);
    const file = fs.createWriteStream(path.join(downloadDir, fileName));

    const curl = spawn('curl', [mediaURL]);
    curl.stdout.on('data', data => { file.write(data) });
    curl.stdout.on('end', () => { file.end() });
    curl.on('exit', code => { resolve() });
  })
}

module.exports = {
  handleJob
}