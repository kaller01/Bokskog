import StatusCodes from 'http-status-codes';
import { Request, Response, Router } from 'express';

import audiobooks from '../controllers/audiobooks';
import { ParamMissingError } from '@shared/errors';
// import { IAudiobook } from '../models/Audiobook';

import { createReadStream, stat } from 'fs';
import { promisify } from 'util';
import Mustache from 'mustache';
import path from 'path';
import users from '../controllers/users';
const fileInfo = promisify(stat);

const router = Router();


router.route("/")
    .get(async (req: Request, res: Response) => {
        const files = await audiobooks.scanForBooks()
        audiobooks.scanAndAdd(files);
        res.json(files);
    }).post(async (req, res) => {
        let user = await users.addUser(req.body)
        res.json(user);
    })

router.route("/:name")
    .get(async (req: Request, res: Response) => {
        let user = await users.addUser({
            admin: false,
            listen: true,
            name: String(req.params.name)
        })
        res.redirect(process.env.BOKSKOG_PUBLIC + "api/"+user._id+"/audiobook/rss");
    })

// Export default
export default router;
