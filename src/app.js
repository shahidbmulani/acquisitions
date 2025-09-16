import express from 'express';
import logger from './config/logger.js';

const app = express();

app.get('/', (req, res) => {
    logger.info('hello from logger');
  req.status(200).send('Hello from acquisitions');
});

export default app;
