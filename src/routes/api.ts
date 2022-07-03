import { Router } from 'express';
// import userRouter from './user-router';
import audiobookRouter from './audiobook-router';
import adminRouter from './admin-router';
import { NoPermissionError } from '@shared/errors';
import users from '../controllers/users';




// Export the base-router
const baseRouter = Router();

// Setup routers
baseRouter.use("/audiobook", async (req, res, next) => {
    if (!req.query.auth) throw new NoPermissionError();
    const authid = req.query.auth;
    const user = await users.getUser(String(authid));
    if (user.listen) next();
    else throw new NoPermissionError();
}, audiobookRouter);
baseRouter.use("/admin", async (req, res, next) => {
    if (!req.query.auth) throw new NoPermissionError();
    const authid = req.query.auth;
    const user = await users.getUser(String(authid));
    if (user.admin) next();
    else throw new NoPermissionError();
}, adminRouter);

// Export default.
export default baseRouter;
