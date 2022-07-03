"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Audiobook_1 = require("../models/Audiobook");
const errors_1 = require("@shared/errors");
const Config_1 = require("../models/Config");
const mustache_1 = __importDefault(require("mustache"));
const path_1 = __importDefault(require("path"));
const glob = require("glob");
const getAudiobooks = () => {
    return Audiobook_1.AudiobookDB.find();
};
const addAudiobook = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const audiobook = Audiobook_1.AudiobookDB.add(Object.assign({}, data));
        return audiobook;
    }
    catch (error) {
        // if (error instanceof ModelDBError)
        throw new errors_1.ParsingError(error);
        // else throw new InternalError(error);
    }
});
const getAudiobook = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const audiobook = yield Audiobook_1.AudiobookDB.findById(id);
        if (!audiobook)
            throw new errors_1.AudiobookNotFound(id);
        return audiobook;
    }
    catch (error) {
        throw new errors_1.InternalError(error);
    }
});
const generatePodcast = (books, authid) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield Config_1.rssConfig.getData();
    data.audiobooks = books;
    for (const [i, book] of books.entries()) {
        data.audiobooks[i].url = process.env.BOKSKOG_PUBLIC + "api/audiobook/" + book._id + "/play.mp3?auth=" + authid;
    }
    let template = yield (0, Config_1.getTemplateRss)();
    return mustache_1.default.render(template, data);
});
const fileExists = (file) => {
    const books = Audiobook_1.AudiobookDB.find();
    for (const book of books) {
        if (book.file === file)
            return true;
    }
    return false;
};
const scanForBooks = () => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve) => {
        if (!process.env.BOKSKOG_LOCAL)
            throw new errors_1.InternalError(null);
        glob(process.env.BOKSKOG_LOCAL + "audiobooks/*/*.+(mp3|m4a|m4b|acc|ogg|wav)", { cwd: process.env.BOKSKOG_LOCAL }, (err, files) => {
            if (err)
                throw err;
            files = files.map((match) => {
                return path_1.default.relative(String(process.env.BOKSKOG_LOCAL + "audiobooks/"), match);
            });
            resolve(files);
        });
    });
});
const scanAndAdd = (files) => __awaiter(void 0, void 0, void 0, function* () {
    files.forEach(file => {
        if (!fileExists(file)) {
            const parts = path_1.default.parse(file);
            console.log(parts);
            addAudiobook({
                file,
                name: parts.dir,
                ext: parts.ext.replace(".", "")
            });
        }
    });
});
exports.default = { getAudiobooks, addAudiobook, getAudiobook, generatePodcast, scanForBooks, scanAndAdd };
