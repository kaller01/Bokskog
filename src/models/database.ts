import fs from 'fs';
import { randomUUID } from "crypto";

export abstract class JSONDB {
    data: Object = {};
    path: string | undefined;

    constructor(path: string | undefined) {
        this.path = path;
    }

    abstract applyDefault(): void;

    async load() {
        if (this.path)
            try {
                const content = await fs.readFileSync(this.path, 'utf8')
                this.data = JSON.parse(content);
            } catch (error) {
                await fs.writeFileSync(this.path, JSON.stringify(this.data, null, 4))
                this.applyDefault();
                this.savedb();
            }
    }

    savedb() {
        if (this.path)
            return fs.writeFileSync(this.path, JSON.stringify(this.data, null, 4), 'utf8')
    }

}

export abstract class DBError extends Error {
    constructor(msg: string) {
        super(msg);
    }
}
export abstract class ModelDBError extends Error {
    schema: Schema;
    constructor(msg: string, schema: Schema) {
        super(msg);
        this.schema = schema;

        Object.setPrototypeOf(this, ModelDBError.prototype);
    }
}
export class NotFoundDBError extends DBError {
    constructor(id: string) {
        super(`Id ${id} not found`);
    }
}
export class MissingRequirementsDBError extends ModelDBError {
    constructor(key: string, schema: Schema) {
        super(`Missing ${key} in ${schema.name}`, schema);
    }
}

export interface SchemaItem {
    required: boolean
}

export interface Schema {
    readonly name: string
    readonly model: {
        [key: string]: SchemaItem
    }

}

export interface DBModel {
    readonly _id: string
}
interface ModelStructure<Model extends DBModel> {
    [key: string]: Model
}
export class ModelJSONDB<Model extends DBModel> extends JSONDB {
    data: ModelStructure<Model> = {}
    schema: Schema;
    defaultData: Object | null;

    constructor(path: string, schema: Schema, defaultData: Object | null) {
        super(path);
        this.schema = schema;
        this.defaultData = defaultData;
    }

    applyDefault(): void {
        if (this.defaultData != null)
            this.add(this.defaultData)
    }

    async find(): Promise<Model[]> {
        await this.load();
        const data = this.data;
        return Object.keys(this.data)
            .map(function (id) {
                return {
                    ...data[id],
                    _id: id
                }
            })
    }

    async findById(id: string): Promise<Model> {
        await this.load();
        if (!this.exists(id)) throw new NotFoundDBError(id);
        return {
            ...this.data[id],
            _id: id
        }
    }

    async update(model: Model) {
        const id = model._id;
        const data = <any>model;
        delete data._id;
        this.write(id, data);
    }

    async add(input: Object): Promise<Model> {
        let model = <Model>input;
        try {
            this.applySchema(model);
            let id = randomUUID();
            while (this.exists(id)) {
                id = randomUUID();
            }
            this.write(id, model);
            return await this.findById(id);
        } catch (e) {
            throw e;
        }
    }

    private write(id: string, model: Model) {
        this.data[id] = model;
        this.savedb();
    }

    private applySchema(input: Model | Object): void {
        for (const key of Object.keys(this.schema.model)) {
            if (!(key in input)) throw new MissingRequirementsDBError(key, this.schema);
        }
    }

    exists(id: string) {
        return Object.keys(this.data).includes(id);
    }
}

interface KeyStructure<T> {
    [key: string]: T
}

export class KeyJSONDB extends JSONDB {
    data: KeyStructure<any> = {}
    defaultData: KeyStructure<any> = {};

    constructor(path: string, defaultData: KeyStructure<any>) {
        super(path);
        this.defaultData = defaultData;
    }

    applyDefault(): void {
        this.data = this.defaultData;
    }

    set<T>(key: string, data: T) {
        this.write(key, data);
    }

    get<T>(key: string): T | null {
        this.load();
        if (this.exists(key))
            return this.data[key]
        else return null;
    }

    async getData(): Promise<KeyStructure<any>> {
        await this.load();
        return this.data;
    }

    exists(key: string) {
        return Object.keys(this.data).includes(key);
    }

    private write(key: string, data: any) {
        this.data[key] = data;
        this.savedb();
    }

}