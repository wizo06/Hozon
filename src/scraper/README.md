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

- [Twitter](#twitter)

## Twitter
**Step 1: API token**

Hozon uses Twitter's v2 API directly (no libraries or wrappers) by consuming it with HTTP requests. You will have to create your own Twitter Project and App in [Twitter's Developer Portal](https://developer.twitter.com/en/portal/dashboard). As of writing this (May 24th, 2021), Twitter's v2 API can only be accessed by Apps *inside* a Project.

Once you've created your Project, and then an App inside that Project, generate a **Bearer Token** for that App.

Open the `config/config.toml` file, and set `api.twitter.bearer` to your Bearer Token. Example:

```toml
[api]
  [api.twitter]
  bearer = "mysupersecretbearertoken"

```

**Step 2: Usernames**

Provide a list of usernames whose media you want to scrape from, by adding each username inside `watchlist/twitter.txt`. One line per username.

**Step 3: Start the scraper**

```
npm run twitter
```