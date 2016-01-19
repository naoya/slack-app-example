import Botkit from 'botkit'
import Twitter from 'twitter'
import _ from 'lodash'

const twitterCli = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

function getWeatherTweet() {
  return new Promise((resolve, reject) => {
    twitterCli.get('/search/tweets.json', {
      q: "from:Yahoo_weather #東京の天気",
    }, (err, tweets) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(_.first(tweets.statuses));
    });
  });
}

const controller = Botkit.slackbot({
  debug: false,
  json_file_store: './simple_storage/'
}).configureSlackApp({
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  scopes: ['commands']
});

controller.setupWebserver(process.env.PORT, (err, webserver) => {
  controller.createWebhookEndpoints(webserver);
  controller.createOauthEndpoints(webserver, (err, req, res) => {
    if (err) {
      res.status(500).send('Error: ' + JSON.stringify(err));
    } else {
      res.send('Success');
    }
  });
});

controller.on('slash_command', (bot, message) => {
  switch(message.command) {
    case '/weather':
      getWeatherTweet().then((tweet) => {
        bot.replyPublic(message, tweet.text);
      });
      break;
  }
});
