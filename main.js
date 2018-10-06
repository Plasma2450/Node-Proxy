/*
 * Main.js
 * Joss Bird
 */

const express       = require('express');
const webInterface  = express();
const request       = require('request');

webInterface.listen(80, console.log(`[*] Started web interface on port ${80}`));

webInterface.get('/get/:url', (req, res) => {
    let url = Buffer.from(req.params.url, 'hex').toString('utf8');
    console.log(url);
    request(url, (err, response, body) => {
        res.send(body);
    })
})

console.log(Buffer.from('http://google.com', 'utf8').toString('hex'));