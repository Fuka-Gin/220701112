const express = require('express');
const router = express.Router();
const urlModel = require('../model/urlData');
const clickModel = require('../model/clickData');
const port = 3000;

router.post('/shorturls', (req, res) => {
    let {url, validity, shortcode} = req.body;
    if(!validity){
        logEntry('backend','warn', 'handler', 'Validity is not provided, setting validity to 30 days as default');
    }
    if(!shortcode){
        shortcode = Math.random().toString(36).substring(2, 8);
        logEntry('backend','info', 'handler', 'Shortcode is not provided, generating a random shortcode for the URL');
        console.log(`Shortcode generated: ${shortcode}`);
    }
    if(!url || !validity || !shortcode) {
        logEntry('backend','error', 'handler', 'Invalid request body');
        return res.status(400).json({ error: 'Invalid request body' });
    }

    const newUrl = new urlModel({
        url,
        validity,
        shortcode,
        expiry: new Date(Date.now() + validity * 24 * 60 * 60 * 1000),
        creationDate: new Date(Date.now()),
        numberOfClicks: 0
    });

    newUrl.save().then(() => {
        logEntry('backend','info', 'handler', 'Short URL created successfully');
        console.log(`Short URL created: http://localhost:${port}/${shortcode}`);
        return res.status(201).json({
            shortlink: `http://localhost:${port}/${shortcode}`,
            expiry: new Date(Date.now() + validity * 24 * 60 * 60 * 1000).toISOString()
        });
    }).catch(err => {
        logEntry('backend','error', 'handler', 'Error creating short URL');
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    });
});

router.get('/shorturls/:shortcode', (req, res) => {
    const shortcode = req.params.shortcode;
    const currentLink = urlModel.findOne({ shortcode: shortcode });
    if(!currentLink) {
        logEntry('backend','error', 'handler', 'Shortcode not found');
        return res.status(404).json({ error: 'Shortcode not found' });
    }
    currentLink.then(link => {
        if(new Date(link.expiry) < new Date()) {
            logEntry('backend','error', 'handler', 'Shortcode has expired');
            return res.status(410).json({ error: 'Shortcode has expired' });
        }
        link.numberOfClicks += 1;
        link.save().then(() => {
            logEntry('backend','info', 'handler', 'Short URL accessed successfully');
            return res.redirect(link.url);
        }).catch(err => {
            logEntry('backend','error', 'handler', 'Error updating click count');
            return res.status(500).json({ error: 'Internal server error' });
        });
    }).catch(err => {
        logEntry('backend','error', 'handler', 'Error finding shortcode');
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    });

});

async function logEntry(stack, level, package, message) {
    const response = await fetch('http://20.244.56.144/evaluation-service/log', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            stack: stack,
            level: level,
            package: package,
            message: message
        })
    });
    if(response.ok) {
        console.log(await response.json());
    }
};

module.exports = router;