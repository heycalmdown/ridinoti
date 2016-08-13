const superagent = require('superagent-bluebird-promise');
const url = require('url');
const _ = require('lodash');
const CONFIG = require('./config.json');
const s = CONFIG.accessKeyId && require('./s3') || require('./fs');

const request = superagent.agent();
const api = new (require('telegram-promise'))(CONFIG.TELEGRAM_TOKEN);

const base = (url) => url.startsWith('http') && url || 'https://ridibooks.com' + url;
const strip = (message) => message.replace(/\<p\>/, '').replace('\<\/p\>', '');
const sideEffect = (fn) => (o => { fn(o); return o });

function push(item) {
  const text = `${strip(item.message)}\n${base(item.landingUrl)}`;
  return api.sendMessage({chat_id: CONFIG.TELEGRAM_ID, text, parse_mode: 'HTML'});
}

function fetch(limit) {
  const query = {query: {user_id: CONFIG.RIDI_ID, password: CONFIG.RIDI_PW}};
  const uri = `https://ridibooks.com/account/action/login${url.format(query)}`;
  return request.get(uri).then(() => request.get('https://ridibooks.com'))
    .then(() => request.get(`http://api.ridibooks.com/v0/notifications?limit=${limit}`))
    .then(res => res.body.notifications);
}

exports.handler = (event, context, callback) => {
  s.read('.pushed', []).then(pushed => {
    fetch(20).map(JSON.parse).filter(item => !_.includes(pushed, item.itemId))
      .map(sideEffect(push)).then(o => {
        s.write('.pushed', pushed.concat(_.map(o, 'itemId')).slice(0, 100));
      });
  }).then(callback, callback);
};

if (!module.parent) {
  exports.handler(null, null, (e) => e && console.log(e));
}
