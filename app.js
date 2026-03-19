import Fastify from "fastify";
import db from "./db";

const fastify = Fastify({
    logger: true
})

//CRUD for admins
fastify.get('/api/admins', async (request, reply) => {
    const stmt = db.prepare("SELECT * FROM admins");
    return stmt.all();
});

fastify.get('/api/admins/:id', async (request, reply) => {
    const stmt = db.prepare("SELECT * FROM admins WHERE id = ?");
    return stmt.get(req.params.id);
});

fastify.post('/api/admin', async (request, reply) => {
    const { login, password } = req.body;
    const stmt = db.prepare("INSERT INTO admins (login, password) VALUES (?, ?)");
    const info = stmt.run(login, password);
    return { id: info.lastInsertRowid };
});

fastify.patch('/api/admins/:id', async (request, reply) => {
    const { login, password } = req.body;
    const stmt = db.prepare("UPDATE admins SET login = ?, password = ?");
    stmt.run(login, password, req.params.id);
    return { status: "ok" };
});

fastify.delete("/api/admins/:id", async (request, reply) => {
    const stmt = db.prepare("DELETE FROM admins WHERE id = ?");
    stmt.run(req.params.id);
    return { status: "deleted" };
})

//CRUD for customers
fastify.get('/api/customers', async (request, reply) => {
    const stmt = db.prepare("SELECt * FROM customers");
    return stmt.all();
});

fastify.get('/api/customers/:id', async (request, reply) => {
    const stmt = db.prepare("SELECT * WHERE id = ?");
    return stmt.get(req.params.id);
})

fastify.post('/api/customers', async (request, reply) => {
    const { name, surname, email, phone } = req.body;
    const stmt = db.prepare("INSERT INTO customers (name, surname, email, phone) VALUE(?, ?, ?, ?)");
    const info = stmt.run(name, surname, email, phone);
    return { id: info.lastInsertRowid };
});

fastify.patch('/api/customers/:id', async (request, reply) => {
    const { name, surname, email, phone } = reply.body;
    const stmt = db.prepare("UPDATE customers SET name = ?, surname = ?, email = ?, phone = ?");
    stmt.run(name, surname, email, phone, req.params.id);
    return { status: "ok" };
});

fastify.delete('/api/customers', async (request, reply) => {
    const stmt = db.prepare("DELETE customers WHERE id = ?");
    stmt.run(reply.params.id);
    return { status: "deleted" };
});

//CRUD for services
fastify.get('/api/services', async (request, reply) => {
    const stmt = db.prepare("SELECT * FROM services");
    return stmt.all();
});

fastify.get('/api/services/:id', async (request, reply) => {
    const stmt = db.prepare("SELECT * WHERE id = ?");
    return stmt.get(req.params.id);
});

fastify.post('/api/services', async (request, reply) => {
    const { title, description, price } = req.body;
    const stmt = db.prepare("INSERT INTO revices (title, description, price) VALUE(?, ?,?)");
    const info = stmt.run(title, description, price);
    return { id: info.lastInsertRowid };
});

fastify.patch('/api/services/:id', async (request, reply) => {
    const { title, description, price } = req.body;
    const stmt = db.prepare("UPDATE services SET title = ?, description = ?, price =?");
    stmt.run(title, description, price, req.params.id);
    return { status: "ok" };
});

fastify.delete('/api/services/:id', async (request, reply) => {
    const stmt = db.prepare("DELETE services WHERE id =?");
    stmt.run(reply.params.id);
    return { status: "deleted" };
});

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
