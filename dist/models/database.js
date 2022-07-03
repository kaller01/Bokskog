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
exports.KeyJSONDB = exports.ModelJSONDB = exports.MissingRequirementsDBError = exports.NotFoundDBError = exports.ModelDBError = exports.DBError = exports.JSONDB = void 0;
const fs_1 = __importDefault(require("fs"));
const crypto_1 = require("crypto");
class JSONDB {
    constructor(path) {
        this.data = {};
        this.path = path;
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.path)
                try {
                    const content = yield fs_1.default.readFileSync(this.path, 'utf8');
                    this.data = JSON.parse(content);
                }
                catch (error) {
                    yield fs_1.default.writeFileSync(this.path, JSON.stringify(this.data, null, 4));
                    this.applyDefault();
                    this.savedb();
                }
        });
    }
    savedb() {
        if (this.path)
            return fs_1.default.writeFileSync(this.path, JSON.stringify(this.data, null, 4), 'utf8');
    }
}
exports.JSONDB = JSONDB;
class DBError extends Error {
    constructor(msg) {
        super(msg);
    }
}
exports.DBError = DBError;
class ModelDBError extends Error {
    constructor(msg, schema) {
        super(msg);
        this.schema = schema;
        Object.setPrototypeOf(this, ModelDBError.prototype);
    }
}
exports.ModelDBError = ModelDBError;
class NotFoundDBError extends DBError {
    constructor(id) {
        super(`Id ${id} not found`);
    }
}
exports.NotFoundDBError = NotFoundDBError;
class MissingRequirementsDBError extends ModelDBError {
    constructor(key, schema) {
        super(`Missing ${key} in ${schema.name}`, schema);
    }
}
exports.MissingRequirementsDBError = MissingRequirementsDBError;
class ModelJSONDB extends JSONDB {
    constructor(path, schema, defaultData) {
        super(path);
        this.data = {};
        this.schema = schema;
        this.defaultData = defaultData;
    }
    applyDefault() {
        if (this.defaultData != null)
            this.add(this.defaultData);
    }
    find() {
        this.load();
        const data = this.data;
        return Object.keys(this.data)
            .map(function (id) {
            return Object.assign(Object.assign({}, data[id]), { _id: id });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.load();
            if (!this.exists(id))
                throw new NotFoundDBError(id);
            return Object.assign(Object.assign({}, this.data[id]), { _id: id });
        });
    }
    add(input) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = input;
            try {
                this.applySchema(model);
                let id = (0, crypto_1.randomUUID)();
                while (this.exists(id)) {
                    id = (0, crypto_1.randomUUID)();
                }
                this.write(id, model);
                return yield this.findById(id);
            }
            catch (e) {
                throw e;
            }
        });
    }
    write(id, model) {
        this.data[id] = model;
        this.savedb();
    }
    applySchema(input) {
        for (const key of Object.keys(this.schema.model)) {
            if (!(key in input))
                throw new MissingRequirementsDBError(key, this.schema);
        }
    }
    exists(id) {
        return Object.keys(this.data).includes(id);
    }
}
exports.ModelJSONDB = ModelJSONDB;
class KeyJSONDB extends JSONDB {
    constructor(path, defaultData) {
        super(path);
        this.data = {};
        this.defaultData = {};
        this.defaultData = defaultData;
    }
    applyDefault() {
        this.data = this.defaultData;
    }
    set(key, data) {
        this.write(key, data);
    }
    get(key) {
        this.load();
        if (this.exists(key))
            return this.data[key];
        else
            return null;
    }
    getData() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.load();
            return this.data;
        });
    }
    exists(key) {
        return Object.keys(this.data).includes(key);
    }
    write(key, data) {
        this.data[key] = data;
        this.savedb();
    }
}
exports.KeyJSONDB = KeyJSONDB;
