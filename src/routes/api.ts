import { Router } from 'express';
// import userRouter from './user-router';
import audiobookRouter from './audiobook-router';
import adminRouter from './admin-router';
import { NoPermissionError } from '@shared/errors';
import users from '../controllers/users';




// Export the base-router
const baseRouter = Router();

// Setup routers
baseRouter.use("/:auth/audiobook", async (req, res, next) => {
    const authid = req.params.auth;
    const user = await users.getUser(String(authid));
    res.locals.user = user;
    if (user.listen) next();
    else throw new NoPermissionError();
}, audiobookRouter);
baseRouter.use("/:auth/admin", async (req, res, next) => {
    const authid = req.params.auth;
    const user = await users.getUser(String(authid));
    res.locals.user = user;
    if (user.admin) next();
    else throw new NoPermissionError();
}, adminRouter);

// Export default.
export default baseRouter;
