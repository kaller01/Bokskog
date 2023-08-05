import { Audiobook, AudiobookDB } from "../models/Audiobook";
import { AudiobookNotFound, RequestError, InternalError, ParamMissingError, ParsingError } from "@shared/errors";
import { MissingRequirementsDBError, ModelDBError } from "../models/database";
import { getTemplateRss, rssConfig } from "../models/Config";
import Mustache from "mustache";
import path, { resolve } from "path";
const glob = require("glob");
import { createReadStream, ReadStream, stat } from 'fs';
import { promisify } from 'util';
import { PassThrough, Stream } from "stream";
import { User } from "@models/User";
const { getAudioDurationInSeconds } = require('get-audio-duration')
const fileInfo = promisify(stat);

const getAudiobooks = () => {
    return AudiobookDB.find()
}

const addAudiobook = async (data: Object): Promise<Audiobook> => {
    try {
        const audiobook = AudiobookDB.add({
            ...data
        });
        return audiobook;
    } catch (error: any | ModelDBError) {
        // if (error instanceof ModelDBError)
        throw new ParsingError(error);
        // else throw new InternalError(error);
    }
}

const getAudiobook = async (id: string): Promise<Audiobook> => {
    try {
        const audiobook = await AudiobookDB.findById(id);
        if (!audiobook) throw new AudiobookNotFound(id);
        return audiobook;
    } catch (error) {
        throw new InternalError(error);
    }
}

const generatePodcast = async (books: Audiobook[], user: User): Promise<string> => {
    const data = await rssConfig.getData();
    data.audiobooks = books;
    for (const [i, book] of books.entries()) {
        data.audiobooks[i].url = process.env.BOKSKOG_PUBLIC + "api/" + user._id + "/audiobook/" + book._id + "/play.mp3"
    }
    data.user = user;
    let template = await getTemplateRss();
    return Mustache.render(template, data);
}

const bookExists = async (dir: string) => {
    const books = await AudiobookDB.find()
    for (const book of books) {
        if (book.dir === dir) return book._id;
    }
    return false;
}

interface audiofile {
    dir: string;
    ext: string;
    duration: number;
    length: number,
    audio: {
        path: string,
        size: number
    }[]
}

const scanForBooks = async (): Promise<audiofile[]> => {
    return new Promise((resolve) => {
        if (!process.env.BOKSKOG_LIBRARY) throw new InternalError(null);
        glob("./*/*.+(mp3|m4a|m4b|acc|ogg|wav)", { root: process.env.BOKSKOG_LIBRARY }, async (err: any, paths: string[]) => {
            if (err) throw err;

            const files: { [key: string]: audiofile } = {};

            for (const filepath of paths) {
                const { dir, ext } = path.parse(filepath)
                console.log(filepath, path.parse(filepath))
                if (!Object.keys(files).includes(dir)) {
                    files[dir] = {
                        dir: path.relative(String(process.env.BOKSKOG_LIBRARY + "audiobooks/"), dir),
                        ext,
                        audio: [],
                        duration: 0,
                        length: 0,
                    };
                }
                const { size } = await fileInfo(filepath);
                const duration = await getAudioDurationInSeconds(filepath);
                files[dir].duration += duration;
                files[dir].length += size;
                files[dir].audio.push({
                    path: filepath,
                    size
                })
            }
            let result: audiofile[] = Object.keys(files)
                .map(function (key) {
                    return files[key];
                });

            // result = result.filter(audio => !bookExists(audio.dir))
            resolve(result);
        })
    })
}



const scanAndAdd = (files: audiofile[]) => {
    files.forEach(async file => {
        let id = await bookExists(file.dir);
        if (id) {
            AudiobookDB.update({
                file: file.audio,
                name: file.dir,
                dir: file.dir,
                length: file.length,
                duration: Math.floor(file.duration),
                ext: file.ext.replace(".", ""),
                _id: id,
            })
        } else {
            AudiobookDB.add({
                file: file.audio,
                name: file.dir,
                dir: file.dir,
                length: file.length,
                duration: Math.floor(file.duration),
                ext: file.ext.replace(".", "")
            })
        }
    });
}

const pipeStreams = (streams: Stream[]): Stream => {
    //If there is only one stream, return that stream
    if (streams.length == 1) return streams[0];
    const out = new PassThrough()
    // Piping the first stream to the out stream
    // Also prevent the automated 'end' event of out stream from firing
    streams[0].pipe(out, { end: false })
    for (let i = 0; i < streams.length - 2; i++) {
        // On the end of each stream (until the second last) pipe the next stream to the out stream
        // Prevent the automated 'end' event of out stream from firing
        streams[i].on('end', () => {
            streams[i + 1].pipe(out, { end: false })
        })
    }
    // On the end of second last stream pipe the last stream to the out stream.
    // Don't prevent the 'end flag from firing'
    streams[streams.length - 2].on('end', () => {
        streams[streams.length - 1].pipe(out)
    })
    return out
}

const getReadStreamRange = async (audiobook: Audiobook, start: number, end: number): Promise<Stream> => {
    const streams = []
    let pos = 0
    // console.log("Range", start, end);
    for (const audio of audiobook.file) {
        // console.log(start < pos + audio.size)
        if (start < pos + audio.size) {
            // console.log(end > pos + audio.size)
            if (end > pos + audio.size) {
                // console.log("StreamOverlap", audio.path, { start: (start - pos) < 0 ? 0 : start - pos })
                streams.push(createReadStream(audio.path, { start: (start - pos) < 0 ? 0 : start - pos }));
                pos += audio.size;
            } else {
                // console.log("StreamStartAndEnd", audio.path, { start: (start - pos) < 0 ? 0 : start - pos, end: end - pos })
                streams.push(createReadStream(audio.path, { start: (start - pos) < 0 ? 0 : start - pos, end: end - pos }));
                break;
            }
        } else {
            pos += audio.size;
        }
    }
    const mergedStream = pipeStreams(streams);
    return mergedStream;
}

const getReadStream = async (audiobook: Audiobook): Promise<Stream> => {
    const mergedStream = pipeStreams(audiobook.file.map(f => createReadStream(f.path)))
    return mergedStream;
}



export default { getAudiobooks, addAudiobook, getAudiobook, generatePodcast, scanForBooks, scanAndAdd, getReadStream, getReadStreamRange }