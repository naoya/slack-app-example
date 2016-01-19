'use strict';

var _botkit = require('botkit');

var _botkit2 = _interopRequireDefault(_botkit);

var _twitter = require('twitter');

var _twitter2 = _interopRequireDefault(_twitter);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var twitterCli = new _twitter2.default({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

function getWeatherTweet() {
  return new Promise(function (resolve, reject) {
    twitterCli.get('/search/tweets.json', {
      q: "from:Yahoo_weather #東京の天気"
    }, function (err, tweets) {
      if (err) {
        reject(err);
        return;
      }
      resolve(_lodash2.default.first(tweets.statuses));
    });
  });
}

var controller = _botkit2.default.slackbot({
  debug: false,
  json_file_store: './simple_storage/'
}).configureSlackApp({
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  scopes: ['commands']
});

controller.setupWebserver(process.env.PORT, function (err, webserver) {
  controller.createWebhookEndpoints(webserver);
  controller.createOauthEndpoints(webserver, function (err, req, res) {
    if (err) {
      res.status(500).send('Error: ' + JSON.stringify(err));
    } else {
      res.send('Success');
    }
  });
});

controller.on('slash_command', function (bot, message) {
  switch (message.command) {
    case '/weather':
      getWeatherTweet().then(function (tweet) {
        bot.replyPublic(message, tweet.text);
      });
      break;
  }
});