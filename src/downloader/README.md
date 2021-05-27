# Requirements

- Node.js
- npm

# Getting Started

1. Create a config file called `config.toml` by making a copy of `template.toml` and make the necessary changes according to the RabbitMQ server that you have running.

2. Install dependencies
```
npm i
```

3. Start the downloader
```
npm start
```

The files will be downloaded inside the `archive/` folder.

The pattern of the full path is `archive/<platform>/<userId>(<username>)/<postId>/<mediaId>`