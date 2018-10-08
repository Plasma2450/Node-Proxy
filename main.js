/*
 * Main.js
 * Joss Bird
 */

const express       = require('express');
const webInterface  = express();
const request       = require('request');
const urlRegex      = require('url-regex');
const concat        = require('concat-stream');

const domain        = 'localhost';
const protocol      = 'http';

webInterface.listen(80, console.log(`[*] Started web interface on port ${80}`));

webInterface.get('/url/:url', (req, res) => {

    let redirect = false;
    let redirectLocation = null;

    let url = Buffer.from(req.params.url, 'hex').toString('utf8');

    //console.log('url='+url);

    var write = concat(function(response) {

        if(redirect)
        {
            res.redirect(302, protocol + '://'+domain + '/url/' + Buffer.from(redirectLocation,'utf8').toString('hex'));
        }

        url = url.split('?')[0];
        if(url.substr(-1,1) != '/' && url.split('/').length > 3)
        {
            url = url.split('/')
            url.pop()
            url = url.join('/')
        }

        //console.log('baseUrl='+url);

        let testParse   = Buffer.from(response.toString('utf8'), 'utf8');

        if(response[0] == testParse[0])
        {
            response = response.toString('utf8');

            let tempMatches = response.match(/"\/.*?"/g) || [];
            for(let i = 0; i < tempMatches.length; i++)
            {
                tempMatches[i] = tempMatches[i].split(' ')[0];
                let strippedString = tempMatches[i].replace('"', '').replace('"', '');
                if(strippedString.substr(0, 2) != '//' && strippedString.indexOf('\\') == -1 && strippedString.length != 1)
                {
                    //console.log('old='+tempMatches[i]); 
                    //console.log('new='+url+strippedString);
                    response = response.replace(strippedString, protocol + '://' + domain + '/url/' + Buffer.from(url + strippedString, 'utf8').toString('hex'));
                }
            }

            response = Buffer.from(response,'utf8');
        }
        else
        {
            //console.log('serving non-editable buffer');
        }

        res.end(response);
    });

    req.headers.host = '';

    //console.log(req.headers);

    request
    .get(url, {headers: {'user-agent': req.headers['user-agent']}, followRedirect: false})
    .on('response', (response) =>{
        if(response.statusCode == '301' || response.statusCode == '302')
        {
            redirect = true;
            redirectLocation = response.headers.location;
        }
    })
    .pipe(write);
})

console.log(Buffer.from('https://google.com', 'utf8').toString('hex'));
