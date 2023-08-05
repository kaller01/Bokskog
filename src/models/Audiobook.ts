import path from "path";
import { DBModel, ModelJSONDB, Schema } from "./database";


export interface AudiobookExtra {
    description: string
}

export interface Audiobook extends DBModel, Partial<AudiobookExtra> {
    name: string,
    file: {
        path: string
        size: number
    }[],
    length: number;
    duration: number,
    ext: string,
    dir: string,
}
export const AudiobookSchema: Schema = {
    name: "Audiobook",
    model: {
        name: { required: true },
        file: { required: true },
        ext: { required: true }
    }

}

export const AudiobookDB = new ModelJSONDB<Audiobook>(process.env.BOKSKOG_CONFIG + "audiobooks.json", AudiobookSchema, null)
AudiobookDB.load();