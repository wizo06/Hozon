# Requirements

- Node.js
- npm

# Getting Started

1. Create a config file called `config.toml` by making a copy of `template.toml` and make the necessary changes according to the RabbitMQ server that you have running.

2. Install dependencies
```
npm i
```

3. To start scraping, follow the steps for the specific social media you want to scrape from.

- [Instagram](#instagram)
- [Twitter](#twitter)

## Instagram

**Step 1: Cookie**

As of writing this (July 26th, 2021), Instagram requires the user to be logged in to view any content. To overcome this, Hozon will use a Cookie session ID during the webscrape.

To obtain your own Cookie session ID:
1. Open browser
2. Open DevTools -> Go to "Network" tab
3. Log into Instagram
4. In the "Network" tab, filter by the keyword "`graphql`"
5. Select any of the results
6. In the "Headers" tab, look for `Request Headers`, then `cookie`
7. The value of `cookie` is your Cookie session ID

Open the `config/config.toml` file, and set `instagram.cookie` to your Cookie session ID. Example:

```toml
[instagram]
cookie = 'mysupersecretcookiesessionid'
```

**Step 2: Watchlist**

Provide a list of usernames whose media you want to scrape from, by adding each username inside `watchlist/instagram.txt`. One line per username.

**Step 3: Start the scraper**

```
npm run instagram
```

## Twitter
**Step 1: API token**

Hozon uses Twitter's v2 API. This means you will have to create your own Twitter Project and App in [Twitter's Developer Portal](https://developer.twitter.com/en/portal/dashboard). As of writing this (May 24th, 2021), Twitter's v2 API can only be accessed by Apps *inside* a Project.

Once you've created your Project, and then an App inside that Project, generate a **Bearer Token** for that App.

Open the `config/config.toml` file, and set `twitter.bearer` to your Bearer Token. Example:

```toml
[twitter]
bearer = "mysupersecretbearertoken"
```

**Step 2: Watchlist**

Provide a list of usernames whose media you want to scrape from, by adding each username inside `watchlist/twitter.txt`. One line per username.

**Step 3: Start the scraper**

```
npm run twitter
```