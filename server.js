const express = require('express');

const got = require('got');
const ical = require('ical-generator');

const LAUNCHES_URL = 'https://api.spacexdata.com/v4/launches';
const DEFAULT_PORT = 3000;

const app = express();

const getLaunches = async function(){
    const data = await got(LAUNCHES_URL, {
        responseType: 'json',
    });
    
    return data.body;
};

app.get('/', async (request, respons) => {
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
