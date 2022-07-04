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
// import { IAudiobook } from '../models/Audiobook';
const fs_1 = require("fs");
const util_1 = require("util");
const users_1 = __importDefault(require("../controllers/users"));
const fileInfo = (0, util_1.promisify)(fs_1.stat);
const router = (0, express_1.Router)();
router.route("/")
    .get((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const files = yield audiobooks_1.default.scanForBooks();
    audiobooks_1.default.scanAndAdd(files);
    res.json(files);
})).post((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let user = yield users_1.default.addUser(req.body);
    res.json(user);
}));
router.route("/:name")
    .get((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let user = yield users_1.default.addUser({
        admin: false,
        listen: true,
        name: String(req.params.name)
    });
    res.redirect(process.env.BOKSKOG_PUBLIC + "api/" + user._id + "/audiobook/rss");
}));
// Export default
exports.default = router;
