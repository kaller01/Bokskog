/**
 * Pre-start is where we want to place things that must run BEFORE the express server is started.
 * This is useful for environment variables, command-line arguments, and cron-jobs.
 */

import path from 'path';
import dotenv from 'dotenv';
import commandLineArgs from 'command-line-args';
import { existsSync } from 'fs';

(async () => {
    // Set the env file
    const result2 = dotenv.config({
        path: path.join(__dirname, `../.env`),
    });
    if (result2.error) {
        throw result2.error;
    }
    if (process.env.BOKSKOG_LOCAL) {
        console.log(process.env.BOKSKOG_LOCAL);
        if (await !existsSync(process.env.BOKSKOG_LOCAL)) throw Error("BOKSKOG_LOCAL does not exist")
    }
})();
