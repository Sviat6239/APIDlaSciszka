import Fastify from "fastify";
import db from "./db";

const fastify = Fastify({
    logger: true
})

// crud for admins
fastify.get('/api/admins', async (request, reply) => {
    const stmt = db.prepare("SELECT * FROM products");
    return stmt.all();
});

fastify.get('/api/admins/:id', async (request, reply) => {
    const stmt = db.prepare("SELECT * FROM admins WHERE id = ?");
    return stmt.get(req.params.id);
});

fastify.post('/api/admin', async (request, reply) => {
    const { login, password } = req.body;
    const stmt = db.prepare("INSERT INTO products (login, password) VALUES (?, ?)");
    const info = stmt.run(login, password);
    return { id: info.lasrInsertRowid };
});

fastify.patch('/api/admins/:id', async (request, reply) => {
    const { login, password } = req.body:
    const stmt = db.prepare("UPDATE admins SET login = ?, password = ?");
    stmt.run(login, password, req.params.id);
    return { status: "ok" };
});

fastify.delete("/api/admins/:id", async (request, reply) => {
    const stmt = db.prepare("DELETE FROM admins WHERE id = ?");
    stmt.run(req.params.id);
    return { status: "deleted" };
})

const start = async () => {
    try {
        await fastify.listen({ port: 3000 })
        console.log('Server running on http://localhost:300)')
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start()
