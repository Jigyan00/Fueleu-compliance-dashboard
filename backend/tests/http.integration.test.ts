import request from "supertest";
import { createApp } from "../src/infrastructure/server/app";

describe("HTTP integration", () => {
    it("returns seeded routes", async () => {
        const app = createApp();
        const response = await request(app).get("/routes");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThanOrEqual(5);
        expect(response.body[0]).toHaveProperty("routeId");
    });

    it("updates baseline route", async () => {
        const app = createApp();
        const response = await request(app).post("/routes/R004/baseline");

        expect(response.status).toBe(200);
        expect(response.body.routeId).toBe("R004");
        expect(response.body.isBaseline).toBe(true);

        const routes = await request(app).get("/routes");
        const baselineCount = routes.body.filter((route: { isBaseline: boolean }) => route.isBaseline).length;

        expect(baselineCount).toBe(1);
    });

    it("returns bank records after banking", async () => {
        const app = createApp();
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

    it("does not allow rebanking the same ship surplus after it reaches zero", async () => {
        const app = createApp();
        const first = await request(app).post("/banking/bank").send({ shipId: "R002", year: 2024 });

        expect(first.status).toBe(200);
        expect(first.body.cb_after).toBe(0);

        const second = await request(app).post("/banking/bank").send({ shipId: "R002", year: 2024 });

        expect(second.status).toBe(400);
        expect(second.body.message).toBe("BANKING_REQUIRES_POSITIVE_CB");
    });

    it("returns adjusted compliance CB after banking for the same ship", async () => {
        const app = createApp();

        const before = await request(app).get("/compliance/cb").query({ shipId: "R002", year: 2024 });
        expect(before.status).toBe(200);
        expect(before.body.cbValue).toBeGreaterThan(0);

        const bank = await request(app).post("/banking/bank").send({ shipId: "R002", year: 2024 });
        expect(bank.status).toBe(200);
        expect(bank.body.cb_after).toBe(0);

        const after = await request(app).get("/compliance/cb").query({ shipId: "R002", year: 2024 });
        expect(after.status).toBe(200);
        expect(after.body.cbValue).toBe(0);
    });

    it("tracks available banked surplus across bank and apply", async () => {
        const app = createApp();

        const initial = await request(app).get("/banking/available");
        expect(initial.status).toBe(200);
        expect(initial.body.amount_gco2eq).toBe(0);

        const bank = await request(app).post("/banking/bank").send({ shipId: "R002", year: 2024 });
        expect(bank.status).toBe(200);

        const afterBank = await request(app).get("/banking/available");
        expect(afterBank.status).toBe(200);
        expect(afterBank.body.amount_gco2eq).toBeGreaterThan(0);

        const apply = await request(app).post("/banking/apply").send({ shipId: "R001", year: 2024 });
        expect(apply.status).toBe(200);

        const afterApply = await request(app).get("/banking/available");
        expect(afterApply.status).toBe(200);
        expect(afterApply.body.amount_gco2eq).toBe(0);
    });
});
