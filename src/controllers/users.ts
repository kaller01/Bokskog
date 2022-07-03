import { AudiobookNotFound, RequestError, InternalError, ParamMissingError, ParsingError } from "@shared/errors";
import { MissingRequirementsDBError, ModelDBError } from "../models/database";
import { User, UserDB } from "../models/User";

const addUser = async (data: Object): Promise<User> => {
    try {
        const user = UserDB.add({
            ...data
        });
        return user;
    } catch (error: any | ModelDBError) {
        throw new ParsingError(error);
    }
}

const getUser = async (id: string): Promise<User> => {
    try {
        const user = await UserDB.findById(id);
        if (!user) throw new InternalError(id);
        return user;
    } catch (error) {
        throw new InternalError(error);
    }
}



export default { addUser, getUser }