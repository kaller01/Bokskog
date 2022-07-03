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
const express_1 = require("express");
const audiobooks_1 = __importDefault(require("../controllers/audiobooks"));
const fs_1 = require("fs");
const util_1 = require("util");
const fileInfo = (0, util_1.promisify)(fs_1.stat);
const router = (0, express_1.Router)();
router.route("/")
    .get((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield audiobooks_1.default.getAudiobooks();
    res.json(data);
}))
    .post((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let audiobook = yield audiobooks_1.default.addAudiobook(req.body);
    // throw new ParamMissingError();
    res.json(audiobook);
}));
router.route("/rss").get((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let books = yield audiobooks_1.default.getAudiobooks();
    const xml = yield audiobooks_1.default.generatePodcast(books, res.locals.user);
    res.type('application/xml');
    res.send(xml);
}));
router.route(`/:id`)
    .get((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const audiobook = yield audiobooks_1.default.getAudiobook(req.params.id);
    res.json(audiobook);
}));
router.route(`/:id/play.mp3`).get((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const audiobook = yield audiobooks_1.default.getAudiobook(req.params.id);
    const size = audiobook.length;
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
        });
        const stream = yield audiobooks_1.default.getReadStreamRange(audiobook, start, end);
        stream.pipe(res);
    }
    else {
        const stream = yield audiobooks_1.default.getReadStream(audiobook);
        res.writeHead(200, {
            'Content-Length': size,
            'Content-Type': 'audio/mp3'
        });
        stream.pipe(res);
    }
}));
// Export default
exports.default = router;
