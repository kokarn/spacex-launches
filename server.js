const fs = require('fs');

const express = require('express');
const got = require('got');
const ical = require('ical-generator');
const marked = require('marked');

const LAUNCHES_URL = 'https://api.spacexdata.com/v4/launches';
const DEFAULT_PORT = 3000;

const app = express();

const getLaunches = async function(){
    const data = await got(LAUNCHES_URL, {
        responseType: 'json',
    });
    
    return data.body;
};

const readmeAsHTML = marked( fs.readFileSync( './readme.md', 'utf8' ) );

const pageMarkup = `<!DOCTYP html>
<html>
<head>
    <meta charset="utf-8"/>
    <title>
        Space Launches RSS
    </title>
    <link rel="stylesheet" href="https://cdn.rawgit.com/sindresorhus/github-markdown-css/gh-pages/github-markdown.css">
    <style>
        .markdown-body {
            box-sizing: border-box;
            min-width: 200px;
            max-width: 980px;
            margin: 0 auto;
            padding: 45px;
        }
    </style>
</head>
<body>
    <div class="markdown-body">
        ${ readmeAsHTML }
    </div>
</body>
</html>`;

app.get('/', (request, response) => {
    response.send(pageMarkup);
});

app.get('/launches.ical', async (request, respons) => {
    const launches = await getLaunches();
    const cal = ical({
        domain: 'localhost',
        name: 'SpaceX launches',
    });
    
    for(const launch of launches){
        cal.createEvent({
            start: new Date(launch.date_utc),
            summary: launch.name,
            description: launch.details,
            url: launch.links.webcast,
        });
    }
    respons.send(cal.toString());
});

app.get('/json', async (request, respons) => {
    respons.json(await getLaunches());
});

app.listen(process.env.PORT || DEFAULT_PORT, () => {
    console.log(`iCal server listening on ${process.env.PORT || DEFAULT_PORT}`);
});
