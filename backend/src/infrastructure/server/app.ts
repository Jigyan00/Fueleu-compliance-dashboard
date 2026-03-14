import cors from "cors";
import express from "express";
import { createHttpRouter } from "../../adapters/inbound/http";

export function createApp() {
    const app = express();

    app.use(cors());
    app.use(express.json());

    app.get("/health", (_req, res) => {
        res.status(200).json({ status: "ok" });
    });

    app.use(createHttpRouter());

    return app;
}
