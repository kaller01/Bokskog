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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
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
const fs_1 = require("fs");
const util_1 = require("util");
const stream = require('stream');
const fileInfo = (0, util_1.promisify)(fs_1.stat);
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
const generatePodcast = (books, user) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield Config_1.rssConfig.getData();
    data.audiobooks = books;
    for (const [i, book] of books.entries()) {
        data.audiobooks[i].url = process.env.BOKSKOG_PUBLIC + "api/" + user._id + "/audiobook/" + book._id + "/play.mp3";
    }
    data.user = user;
    let template = yield (0, Config_1.getTemplateRss)();
    return mustache_1.default.render(template, data);
});
const bookExists = (dir) => {
    const books = Audiobook_1.AudiobookDB.find();
    for (const book of books) {
        if (book.dir === dir)
            return true;
    }
    return false;
};
const scanForBooks = () => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve) => {
        if (!process.env.BOKSKOG_LOCAL)
            throw new errors_1.InternalError(null);
        glob("/audiobooks/*/*.+(mp3|m4a|m4b|acc|ogg|wav)", { root: process.env.BOKSKOG_LOCAL }, (err, paths) => __awaiter(void 0, void 0, void 0, function* () {
            if (err)
                throw err;
            console.log(paths);
            // paths = paths.map((match: string) => {
            //     return path.relative(String(process.env.BOKSKOG_LOCAL + "audiobooks/"), match);
            // });
            const files = {};
            for (const filepath of paths) {
                const { dir, ext } = path_1.default.parse(filepath);
                console.log(filepath, path_1.default.parse(filepath));
                if (!Object.keys(files).includes(dir)) {
                    files[dir] = {
                        dir: path_1.default.relative(String(process.env.BOKSKOG_LOCAL + "audiobooks/"), dir),
                        ext,
                        audio: []
                    };
                }
                const { size } = yield fileInfo(filepath);
                files[dir].audio.push({
                    path: filepath,
                    size
                });
            }
            let result = Object.keys(files)
                .map(function (key) {
                return files[key];
            });
            result = result.filter(audio => !bookExists(audio.dir));
            resolve(result);
        }));
    });
});
const scanAndAdd = (files) => {
    files.forEach((file) => __awaiter(void 0, void 0, void 0, function* () {
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
        });
    }));
};
function concatStreams(readables) {
    return __asyncGenerator(this, arguments, function* concatStreams_1() {
        var e_1, _a;
        for (const readable of readables) {
            try {
                for (var readable_1 = (e_1 = void 0, __asyncValues(readable)), readable_1_1; readable_1_1 = yield __await(readable_1.next()), !readable_1_1.done;) {
                    const chunk = readable_1_1.value;
                    yield yield __await(chunk);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (readable_1_1 && !readable_1_1.done && (_a = readable_1.return)) yield __await(_a.call(readable_1));
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
    });
}
const getReadStreamRange = (audiobook, start, end) => __awaiter(void 0, void 0, void 0, function* () {
    const streams = [];
    let pos = 0;
    // console.log("Range", start, end);
    for (const audio of audiobook.file) {
        // console.log(start < pos + audio.size)
        if (start < pos + audio.size) {
            // console.log(end > pos + audio.size)
            if (end > pos + audio.size) {
                // console.log("StreamOverlap", audio.path, { start: (start - pos) < 0 ? 0 : start - pos })
                streams.push((0, fs_1.createReadStream)(audio.path, { start: (start - pos) < 0 ? 0 : start - pos }));
                pos += audio.size;
            }
            else {
                // console.log("StreamStartAndEnd", audio.path, { start: (start - pos) < 0 ? 0 : start - pos, end: end - pos })
                streams.push((0, fs_1.createReadStream)(audio.path, { start: (start - pos) < 0 ? 0 : start - pos, end: end - pos }));
                break;
            }
        }
        else {
            pos += audio.size;
        }
    }
    const iterable = yield concatStreams(streams);
    const mergedStream = stream.Readable.from(iterable);
    return mergedStream;
});
const getReadStream = (audiobook) => __awaiter(void 0, void 0, void 0, function* () {
    const iterable = yield concatStreams(audiobook.file.map(f => (0, fs_1.createReadStream)(f.path)));
    const mergedStream = stream.Readable.from(iterable);
    return mergedStream;
});
exports.default = { getAudiobooks, addAudiobook, getAudiobook, generatePodcast, scanForBooks, scanAndAdd, getReadStream, getReadStreamRange };
