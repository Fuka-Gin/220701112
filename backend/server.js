const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose');
const route = require('./routes/url');

mongoose.connect('mongodb://localhost:27017/shorturl', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
}).then(() => logEntry('backend','info','handler','MongoDB connected'));

app.use(express.json());

app.use("/", route); 

app.listen(port, () => {
    logEntry('backend','info','handler',`Server is running on http://localhost:${port}`);
    console.log(`Server is running on http://localhost:${port}`);
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