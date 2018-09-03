import express from "express";

declare global {
    interface Request extends express.Request {
        user: Object;
    }

    interface Response extends express.Response {

    }

    interface NextFunction extends express.NextFunction {

    }
}