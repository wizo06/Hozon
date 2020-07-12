# About

Hozon (保存), meaning "preserve" in Japanese, is a collection of hoarding scripts for various social media platforms.

# Supported platforms
- [Artstation (Desktop environment required)](#artstation)
- [Instagram (Desktop environment required)](#instagram)
- [YouTube](#youtube)

# Getting Started
## Artstation
1. Install node dependencies
```
npm install
```
2. Add usernames in `watchlist/artstation_usernames.txt`
3. Start hoarding!
```
npm run artstation
```
4. Media will be saved locally at `archives/artstation/`
## Instagram
1. Install node dependencies
```
npm install
```
2. Add usernames in `watchlist/instagram_usernames.txt`
3. Start hoarding!
```
npm run instagram
```
4. Media will be saved locally at `archives/instagram/`
## YouTube
1. Download `youtube-dl`
```
mkdir bin
curl -L "https://yt-dl.org/downloads/latest/youtube-dl" -o "bin/youtube-dl"
chmod a+rx bin/youtube-dl
```
2. Download `ffmpeg`
```
curl "https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz" -o "bin/ffmpeg.tar.xz"
tar -xf "ffmpeg.tar.xz"

```