import StatusCodes from 'http-status-codes';
import { Request, Response, Router } from 'express';
import audiobooks from '../controllers/audiobooks';
import { createReadStream, stat } from 'fs';
import { promisify } from 'util';
const fileInfo = promisify(stat);

const router = Router();

router.route("/")
    .get(async (req: Request, res: Response) => {
        let data = await audiobooks.getAudiobooks();
        res.json(data);
    })
    .post(async (req: Request, res: Response) => {
        let audiobook = await audiobooks.addAudiobook(req.body);
        // throw new ParamMissingError();
        res.json(audiobook);
    })

router.route("/rss").get(async (req: Request, res: Response) => {
    let books = await audiobooks.getAudiobooks();
    const xml = await audiobooks.generatePodcast(books, String(req.query.auth));
    res.type('application/xml');
    res.send(xml);
})

router.route(`/:id`)
    .get(async (req: Request, res: Response) => {
        const audiobook = await audiobooks.getAudiobook(req.params.id);
        res.json(audiobook);
    })

router.route(`/:id/play.mp3`).get(async (req: Request, res: Response) => {
    const audiobook = await audiobooks.getAudiobook(req.params.id);
    const filename = process.env.BOKSKOG_LOCAL + "audiobooks/" + audiobook.file;
    const { size } = await fileInfo(filename);
    const range = req.headers.range;
    if (range) {
        let [startRaw, endRaw] = range.replace(/bytes=/, '').split('-');
        let start = parseInt(startRaw, 10);
        let end = endRaw ? parseInt(endRaw, 10) : size - 1;

        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': (start - end) + 1,
            'Content-Type': 'audio/mp3'
        })

        createReadStream(filename, { start, end }).pipe(res);
    } else {
        res.writeHead(200, {
            'Content-Length': size,
            'Content-Type': 'audio/mp3'
        });
        createReadStream(filename).pipe(res);
    }
})

// Export default
export default router;
