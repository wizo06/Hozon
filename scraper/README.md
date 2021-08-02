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

- [Artstation](#artstation)
- [Instagram](#instagram)
- [Pixiv](#pixiv)
- [Twitter](#twitter)

## Artstation

**Step 1: Watchlist**

Provide a list of usernames whose images you want to scrape from, by adding each username inside `watchlist/artstation.txt`. One line per username.

The username can be found in the URL when you navigate to a user's profile. For example, if the username is `asdf`, then the URL will look something like this:

```
https://www.artstation.com/asdf
```
or
```
https://asdf.artstation.com/
```

**Step 2: Start the scraper**

```
npm run artstation
```

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

Provide a list of usernames whose images you want to scrape from, by adding each username inside `watchlist/instagram.txt`. One line per username.

**Step 3: Start the scraper**

```
npm run instagram
```

**NOTE**: Private profiles cannot be accessed. However, if the provided Cookie Session ID is from an account that is already following a private profile, then that private profile can be accessed.

## Pixiv

**Step 1: Watchlist**

Provide a list of user IDs whose images you want to scrape from, by adding each user ID inside `watchlist/pixiv.txt`. One line per user ID.

The user ID is the number in the URL when you navigate to a user's profile. For example, if the user ID is `1234567`, then the URL will look something like this:

```
https://www.pixiv.net/en/users/1234567
```

**Step 2: Start the scraper**

```
npm run pixiv
```

**NOTE**: Illustrations that are marked as "sensitive content" cannot be scraped.

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

Provide a list of usernames whose images you want to scrape from, by adding each username inside `watchlist/twitter.txt`. One line per username.

**Step 3: Start the scraper**

```
npm run twitter
```

**NOTE**: Private profiles cannot be accessed.