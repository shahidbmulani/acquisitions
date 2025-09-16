import express from 'express';

const app = express();

app.get('/', (req,res) => {
    req.status(200).send('Hello from acquisitions');
})

export default app;

