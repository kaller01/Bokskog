"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDB = exports.AudiobookSchema = void 0;
const database_1 = require("./database");
exports.AudiobookSchema = {
    name: "Audiobook",
    model: {
        name: { required: true },
        admin: { required: true },
        listen: { required: true }
    }
};
exports.UserDB = new database_1.ModelJSONDB(process.env.BOKSKOG_LOCAL + "users.json", exports.AudiobookSchema, {
    name: "Admin",
    admin: true,
    listen: true
});
exports.UserDB.load();
