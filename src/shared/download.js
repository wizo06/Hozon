const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const curl = (job) => {
  return new Promise((resolve, reject) => {
    const username = job.username;
    const mediaURL = job.mediaURL;
    const fileName = job.fileName;
    const platform = job.platform;

    const downloadDir = path.join(process.cwd(), `archives/${platform}/${username}`);
    const file = fs.createWriteStream(path.join(downloadDir, fileName));

    const subprocess = spawn('curl', [mediaURL]);
    subprocess.stdout.on('data', data => { file.write(data) });
    subprocess.stdout.on('end', () => { file.end() });
    subprocess.on('exit', code => { resolve() });
  });
};

const youtube_dl = (job) => {
  return new Promise((resolve, reject) => {
    if (job.platform === 'twitter') {
      const flags = ['-f', 'best', '-i', '--no-warnings', '-o', `archives/${job.platform}/${job.username}/%(id)s---%(title)s.%(ext)s`];
      const subprocess = spawn(path.join(process.cwd(), 'bin/youtube-dl'), [job.mediaURL, ...flags]);
      subprocess.on('exit', code => { resolve() });
    }
    else if (job.platform === 'youtube') {
      const flags = ['-f', 'bestvideo+bestaudio', '--ffmpeg-location', 'bin/ffmpeg', '-i', '--no-warnings', '-o', `archives/${job.platform}/%(uploader)s/%(id)s---%(title)s.%(ext)s`];
      const subprocess = spawn(path.join(process.cwd(), 'bin/youtube-dl'), [job.mediaURL, ...flags]);
      subprocess.stdout.on('data', data => { process.stdout.write(data.toString()) });
      subprocess.on('exit', code => { resolve() });
    }
  });
};

module.exports = {
  curl,
  youtube_dl
}