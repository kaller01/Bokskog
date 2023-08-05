import { DBModel, ModelJSONDB, Schema } from "./database";

export interface User extends DBModel {
    name: string,
    admin: boolean,
    listen: boolean,
}
export const AudiobookSchema: Schema = {
    name: "Audiobook",
    model: {
        name: { required: true },
        admin: { required: true },
        listen: { required: true }
    }
}

export const UserDB = new ModelJSONDB<User>(process.env.BOKSKOG_CONFIG + "users.json", AudiobookSchema, {
    name: "Admin",
    admin: true,
    listen: true
})

UserDB.load();
UserDB.find().then(users => {
    console.log(users);
})