"use strict";
/**
 * Pre-start is where we want to place things that must run BEFORE the express server is started.
 * This is useful for environment variables, command-line arguments, and cron-jobs.
 */
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
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = require("fs");
(() => __awaiter(void 0, void 0, void 0, function* () {
    // Set the env file
    const result2 = dotenv_1.default.config({
        path: path_1.default.join(__dirname, `../.env`),
    });
    if (result2.error) {
        throw result2.error;
    }
    if (process.env.BOKSKOG_LOCAL) {
        console.log(process.env.BOKSKOG_LOCAL);
        if (yield !(0, fs_1.existsSync)(process.env.BOKSKOG_LOCAL))
            throw Error("BOKSKOG_LOCAL does not exist");
    }
}))();
