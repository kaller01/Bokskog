import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';

import express, { NextFunction, Request, Response } from 'express';
import StatusCodes from 'http-status-codes';
import 'express-async-errors';

import apiRouter from './routes/api';
import logger from 'jet-logger';
import { RequestError, ParsingError } from '@shared/errors';

require("./models/database");

import audiobooks from './controllers/audiobooks';
audiobooks.scanForBooks().then(files => audiobooks.scanAndAdd(files))



// Constants
const app = express();


/***********************************************************************************
 *                                  Middlewares
 **********************************************************************************/

// Common middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Show routes called in console during development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Security (helmet recommended in express docs)
if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
}


/***********************************************************************************
 *                         API routes and error handling
 **********************************************************************************/

// Add api router

app.use("/api", apiRouter);


// Error handling
app.use((err: Error | RequestError, _: Request, res: Response, __: NextFunction) => {
    logger.err(err, true);
    const status = (err instanceof RequestError ? err.HttpStatus : StatusCodes.BAD_REQUEST);
    const type = (err instanceof RequestError ? err.type : "Unknown");
    const data = (err instanceof RequestError ? err.data : null);
    return res.status(status).json({
        error: type,
        message: err.message,
        data: data
    });
});


/***********************************************************************************
 *                                  Front-end content
 **********************************************************************************/

// Set views dir
const viewsDir = path.join(__dirname, 'views');
app.set('views', viewsDir);

// Set static dir
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));

// Serve index.html file
app.get('/', (_: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});



// Export here and start in a diff file (for testing).
export default app;
