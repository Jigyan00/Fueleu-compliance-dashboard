import request from "supertest";
import { createApp } from "../src/infrastructure/server/app";

describe("HTTP integration", () => {
    const app = createApp();

    it("returns seeded routes", async () => {
        const response = await request(app).get("/routes");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThanOrEqual(5);
        expect(response.body[0]).toHaveProperty("routeId");
    });

    it("updates baseline route", async () => {
        const response = await request(app).post("/routes/R004/baseline");

        expect(response.status).toBe(200);
        expect(response.body.routeId).toBe("R004");
        expect(response.body.isBaseline).toBe(true);

        const routes = await request(app).get("/routes");
        const baselineCount = routes.body.filter((route: { isBaseline: boolean }) => route.isBaseline).length;

        expect(baselineCount).toBe(1);
    });

    it("returns bank records after banking", async () => {
        const bank = await request(app).post("/banking/bank").send({ year: 2024 });

        expect(bank.status).toBe(200);

        const records = await request(app).get("/banking/records").query({ year: 2024 });

        expect(records.status).toBe(200);
        expect(Array.isArray(records.body)).toBe(true);
        expect(records.body.length).toBeGreaterThan(0);
        expect(records.body[0]).toHaveProperty("shipId");
        expect(records.body[0]).toHaveProperty("year");
        expect(records.body[0]).toHaveProperty("amount_gco2eq");
    });
});
