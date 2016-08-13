const superagent = require('superagent-bluebird-promise');
const url = require('url');
const _ = require('lodash');
const fs = require('bluebird').promisifyAll(require('fs'));
const CONFIG = require('./config.json');

const request = superagent.agent();
const api = new (require('telegram-promise'))(CONFIG.TELEGRAM_TOKEN);

const base = (url) => url.startsWith('http') && url || 'https://ridibooks.com' + url;
const strip = (message) => message.replace(/\<p\>/, '').replace('\<\/p\>', '');
const sideEffect = (fn) => (o => { fn(o); return o });
const read = (name, def) => fs.readFileAsync(name, 'utf-8').then(JSON.parse).catch(() => def);
const write = (name, data) => fs.writeFileAsync(name, JSON.stringify(data));

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
  read('/tmp/.pushed', []).then(pushed => {
    return fetch(10).map(JSON.parse).filter(item => !_.includes(pushed, item.itemId))
      .map(sideEffect(push)).then(o => {
        write('/tmp/.pushed', pushed.concat(_.map(o, 'itemId')).slice(0, 100));
        return o;
      });
  }).then(pushed => callback(null, pushed.length), callback);
};

if (!module.parent) {
  exports.handler(null, null, () => {});
}
