"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalError = exports.ParamMissingError = exports.AudiobookNotFound = exports.NotFoundError = exports.NoPermissionError = exports.ParsingError = exports.RequestError = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
class RequestError extends Error {
    constructor(type, msg, httpStatus, data) {
        super(msg);
        this.HttpStatus = http_status_codes_1.default.BAD_REQUEST;
        this.type = "RequestError";
        this.data = undefined;
        this.HttpStatus = httpStatus;
        this.type = type;
        this.data = data;
    }
}
exports.RequestError = RequestError;
class ParsingError extends RequestError {
    constructor(error) {
        super(ParsingError.name, error.message, http_status_codes_1.default.BAD_REQUEST, {
            schema: error.schema.model
        });
    }
}
exports.ParsingError = ParsingError;
class NoPermissionError extends RequestError {
    constructor() {
        super(NoPermissionError.name, "No permission to access", http_status_codes_1.default.BAD_REQUEST, null);
    }
}
exports.NoPermissionError = NoPermissionError;
// export class AudiobookParsingError extends ParsingError {
//     constructor() {
//         super("Failed to parse Audiobook", {});
//     }
// }
class NotFoundError extends RequestError {
    constructor(message, id) {
        super(NotFoundError.name, message, http_status_codes_1.default.NOT_FOUND, {
            id
        });
    }
}
exports.NotFoundError = NotFoundError;
class AudiobookNotFound extends NotFoundError {
    constructor(id) {
        super("Audiobook not found", id);
    }
}
exports.AudiobookNotFound = AudiobookNotFound;
class ParamMissingError extends RequestError {
    constructor(param) {
        super(ParamMissingError.name, `Missing parameter ${param}`, http_status_codes_1.default.BAD_REQUEST, {
            param
        });
    }
}
exports.ParamMissingError = ParamMissingError;
class InternalError extends RequestError {
    constructor(e) {
        super(InternalError.name, "Internal server error", http_status_codes_1.default.INTERNAL_SERVER_ERROR, e);
    }
}
exports.InternalError = InternalError;
