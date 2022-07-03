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
const express_1 = require("express");
// import userRouter from './user-router';
const audiobook_router_1 = __importDefault(require("./audiobook-router"));
const admin_router_1 = __importDefault(require("./admin-router"));
const errors_1 = require("@shared/errors");
const users_1 = __importDefault(require("../controllers/users"));
// Export the base-router
const baseRouter = (0, express_1.Router)();
// Setup routers
baseRouter.use("/audiobook", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.query.auth)
        throw new errors_1.NoPermissionError();
    const authid = req.query.auth;
    const user = yield users_1.default.getUser(String(authid));
    if (user.listen)
        next();
    else
        throw new errors_1.NoPermissionError();
}), audiobook_router_1.default);
baseRouter.use("/admin", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.query.auth)
        throw new errors_1.NoPermissionError();
    const authid = req.query.auth;
    const user = yield users_1.default.getUser(String(authid));
    if (user.admin)
        next();
    else
        throw new errors_1.NoPermissionError();
}), admin_router_1.default);
// Export default.
exports.default = baseRouter;
