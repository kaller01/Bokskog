"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudiobookDB = exports.AudiobookSchema = void 0;
const database_1 = require("./database");
exports.AudiobookSchema = {
    name: "Audiobook",
    model: {
        name: { required: true },
        file: { required: true },
        ext: { required: true }
    }
};
exports.AudiobookDB = new database_1.ModelJSONDB(process.env.BOKSKOG_LOCAL + "audiobooks.json", exports.AudiobookSchema, null);
exports.AudiobookDB.load();
