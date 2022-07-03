import { MissingRequirementsDBError, ModelDBError } from '../models/database';
import HttpStatusCodes from 'http-status-codes';
import mongoose from 'mongoose';

export abstract class RequestError extends Error {

    public readonly HttpStatus = HttpStatusCodes.BAD_REQUEST;
    public readonly type: string = "RequestError";
    public readonly data: any = undefined;

    constructor(type: string, msg: string, httpStatus: number, data: any) {
        super(msg);
        this.HttpStatus = httpStatus;
        this.type = type;
        this.data = data;
    }
}

export class ParsingError extends RequestError {
    constructor(error: ModelDBError) {
        super(ParsingError.name, error.message, HttpStatusCodes.BAD_REQUEST, {
            schema: error.schema.model
        });
    }
}

export class NoPermissionError extends RequestError {
    constructor() {
        super(NoPermissionError.name, "No permission to access", HttpStatusCodes.BAD_REQUEST, null);
    }
}
// export class AudiobookParsingError extends ParsingError {
//     constructor() {
//         super("Failed to parse Audiobook", {});
//     }
// }

export class NotFoundError extends RequestError {
    constructor(message: string, id: string) {
        super(NotFoundError.name, message, HttpStatusCodes.NOT_FOUND, {
            id
        });
    }
}
export class AudiobookNotFound extends NotFoundError {
    constructor(id: string) {
        super("Audiobook not found", id);
    }
}

export class ParamMissingError extends RequestError {
    constructor(param: string) {
        super(ParamMissingError.name, `Missing parameter ${param}`, HttpStatusCodes.BAD_REQUEST, {
            param
        });
    }
}

export class InternalError extends RequestError {
    constructor(e: any) {
        super(InternalError.name, "Internal server error", HttpStatusCodes.INTERNAL_SERVER_ERROR, e);
    }
}

