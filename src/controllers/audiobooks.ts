import { Audiobook, AudiobookDB } from "../models/Audiobook";
import { AudiobookNotFound, RequestError, InternalError, ParamMissingError, ParsingError } from "@shared/errors";
import { MissingRequirementsDBError, ModelDBError } from "../models/database";
import { getTemplateRss, rssConfig } from "../models/Config";
import Mustache from "mustache";
import path, { resolve } from "path";
const glob = require("glob");

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

const generatePodcast = async (books: Audiobook[], authid: string): Promise<string> => {
    const data = await rssConfig.getData();
    data.audiobooks = books;
    for (const [i, book] of books.entries()) {
        data.audiobooks[i].url = process.env.BOKSKOG_PUBLIC + "api/audiobook/" + book._id + "/play.mp3?auth=" + authid
    }
    let template = await getTemplateRss();
    return Mustache.render(template, data);
}

const fileExists = (file: string) => {
    const books = AudiobookDB.find()
    for (const book of books) {
        if (book.file === file) return true;
    }
    return false;
}

const scanForBooks = async (): Promise<string[]> => {
    return new Promise((resolve) => {
        if (!process.env.BOKSKOG_LOCAL) throw new InternalError(null);
        glob(process.env.BOKSKOG_LOCAL + "audiobooks/*/*.+(mp3|m4a|m4b|acc|ogg|wav)", { cwd: process.env.BOKSKOG_LOCAL }, (err: any, files: string[]) => {
            if (err) throw err;
            files = files.map((match: string) => {
                return path.relative(String(process.env.BOKSKOG_LOCAL + "audiobooks/"), match);
            });
            resolve(files);
        })
    })
}

const scanAndAdd = async (files: string[]) => {
    files.forEach(file => {
        if (!fileExists(file)) {
            const parts = path.parse(file)
            console.log(parts);
            addAudiobook({
                file,
                name: parts.dir,
                ext: parts.ext.replace(".", "")
            })
        }
    });
}



export default { getAudiobooks, addAudiobook, getAudiobook, generatePodcast, scanForBooks, scanAndAdd }