const request = require("supertest");
const app = require("../src/app");

describe("GET /tasks", () => {
    it("devuelve 200 y un array", async () => {
        const res = await request(app).get("/tasks");

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});

describe("GET /tasks/:id", () => {
    it("devuelve 200 y la tarea cuando existe", async () => {
        const res = await request(app).get("/tasks/1");

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(1);
    });

    it("devuelve 404 cuando no existe", async () => {
        const res = await request(app).get("/tasks/9999");

        expect(res.status).toBe(404);
    });
});

describe("POST /tasks", () => {
    it("devuelve 201, Location y la tarea creada", async () => {
        const res = await request(app)
            .post("/tasks")
            .send({ title: "Study REST" });

        expect(res.status).toBe(201);
        expect(res.headers.location).toBe(`/tasks/${res.body.id}`);
        expect(res.body.title).toBe("Study REST");
    });

    it("devuelve 400 sin title y no modifica la coleccion", async () => {
        const antes = await request(app).get("/tasks");

        const res = await request(app).post("/tasks").send({});

        expect(res.status).toBe(400);

        const despues = await request(app).get("/tasks");
        expect(despues.body.length).toBe(antes.body.length);
    });
});

describe("PUT /tasks/:id", () => {
    it("sustituye la tarea completa y devuelve 200", async () => {
        const creada = await request(app)
            .post("/tasks")
            .send({ title: "Original", userId: 7 });

        const res = await request(app)
            .put(`/tasks/${creada.body.id}`)
            .send({ title: "Study", done: true });

        expect(res.status).toBe(200);
        expect(res.body.title).toBe("Study");
        expect(res.body.done).toBe(true);
        expect(res.body.userId).toBe(null);
    });

    it("devuelve 404 cuando no existe", async () => {
        const res = await request(app)
            .put("/tasks/9999")
            .send({ title: "No existe" });

        expect(res.status).toBe(404);
    });

    it("devuelve 400 sin title", async () => {
        const res = await request(app).put("/tasks/1").send({ done: true });

        expect(res.status).toBe(400);
    });
});

describe("DELETE /tasks/:id", () => {
    it("devuelve 204 con cuerpo vacio", async () => {
        const creada = await request(app)
            .post("/tasks")
            .send({ title: "Para borrar" });

        const res = await request(app).delete(`/tasks/${creada.body.id}`);

        expect(res.status).toBe(204);
        expect(res.text).toBe("");
    });

    it("devuelve 404 cuando no existe", async () => {
        const res = await request(app).delete("/tasks/9999");

        expect(res.status).toBe(404);
    });
});