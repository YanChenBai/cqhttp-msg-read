const WebSocketServer = require('ws')
const messageEvent = require('./events')

const baseUrl = "ws://127.0.0.1:6700"
const ws = new WebSocketServer(baseUrl)

const googleTTS = require('google-tts-api'); // CommonJS

// get audio URL
const url = googleTTS.getAudioUrl('你好', {
    lang: 'zh',
    slow: false,
    host: 'https://translate.google.com',
});
console.log(url);

ws.on("open", () => {
    console.log('连接成功...');
})

ws.on('message', messageEvent);

// ws.on('error', console.error)