import { Audiobook, AudiobookDB } from "../models/Audiobook";
import { AudiobookNotFound, RequestError, InternalError, ParamMissingError, ParsingError } from "@shared/errors";
import { MissingRequirementsDBError, ModelDBError } from "../models/database";
import { getTemplateRss, rssConfig } from "../models/Config";
import Mustache from "mustache";
import path, { resolve } from "path";
const glob = require("glob");
import { createReadStream, ReadStream, stat } from 'fs';
import { promisify } from 'util';
import { Stream } from "stream";
import { User } from "@models/User";
const stream = require('stream')
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

const bookExists = (dir: string) => {
    const books = AudiobookDB.find()
    for (const book of books) {
        if (book.dir === dir) return true;
    }
    return false;
}

interface audiofile {
    dir: string;
    ext: string;
    audio: {
        path: string,
        size: number
    }[]
}

const scanForBooks = async (): Promise<audiofile[]> => {
    return new Promise((resolve) => {
        if (!process.env.BOKSKOG_LOCAL) throw new InternalError(null);
        glob("/audiobooks/*/*.+(mp3|m4a|m4b|acc|ogg|wav)", { root: process.env.BOKSKOG_LOCAL }, async (err: any, paths: string[]) => {
            if (err) throw err;
            console.log(paths)
            // paths = paths.map((match: string) => {
            //     return path.relative(String(process.env.BOKSKOG_LOCAL + "audiobooks/"), match);
            // });

            const files: { [key: string]: audiofile } = {};

            for (const filepath of paths) {
                const { dir, ext } = path.parse(filepath)
                console.log(filepath, path.parse(filepath))
                if (!Object.keys(files).includes(dir)) {
                    files[dir] = {
                        dir: path.relative(String(process.env.BOKSKOG_LOCAL + "audiobooks/"), dir),
                        ext,
                        audio: []
                    };
                }
                const { size } = await fileInfo(filepath);
                files[dir].audio.push({
                    path: filepath,
                    size
                })
            }
            let result: audiofile[] = Object.keys(files)
                .map(function (key) {
                    return files[key];
                });

            result = result.filter(audio => !bookExists(audio.dir))
            resolve(result);
        })
    })
}



const scanAndAdd = (files: audiofile[]) => {
    files.forEach(async file => {
        let length = 0;
        for (let { size } of file.audio) {
            length += size;
        }
        addAudiobook({
            file: file.audio,
            name: file.dir,
            dir: file.dir,
            length,
            ext: file.ext.replace(".", "")
        })

    });
}

async function* concatStreams(readables: any) {
    for (const readable of readables) {
        for await (const chunk of readable) { yield chunk }
    }
}

const getReadStreamRange = async (audiobook: Audiobook, start: number, end: number): Promise<ReadStream> => {
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

    const iterable = await concatStreams(streams)
    const mergedStream = stream.Readable.from(iterable)
    return mergedStream;
}

const getReadStream = async (audiobook: Audiobook): Promise<Stream> => {
    const iterable = await concatStreams(audiobook.file.map(f => createReadStream(f.path)))
    const mergedStream = stream.Readable.from(iterable)
    return mergedStream;
}



export default { getAudiobooks, addAudiobook, getAudiobook, generatePodcast, scanForBooks, scanAndAdd, getReadStream, getReadStreamRange }