# About

Hozon (保存), meaning "preserve" in Japanese, is a collection of hoarding scripts for various social media platforms.

# Supported platforms
- [Artstation](#artstation)
- [Instagram](#instagram)
- [Pixiv](#pixiv)
- [Twitter](#twitter)
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
## Pixiv
1. Install node dependencies
```
npm install
```
2. Add users ID in `watchlist/pixiv_usernames.txt`
3. Add credentials in `config/credentials.json` (optional. If provided, artworks with "sensitive content" can be seen by Hozon.)
4. Start hoarding!
```
npm run pixiv
```
5. Media will be saved locally at `archives/pixiv/`
## Twitter
1. Install node dependencies
```
npm install
```
2. Add usernames in `watchlist/twitter_usernames.txt`
3. Add credentials in `config/credentials.json` (required)
4. Start hoarding!
```
npm run twitter
```
5. Media will be saved locally at `archives/twitter/`
## YouTube
1. Add channels URL in `watchlist/youtube_usernames.txt` (must have an empty line at the end of file)
2. Start hoarding!
```
npm run youtube
```
3. Media will be saved locally at `archives/youtube/`