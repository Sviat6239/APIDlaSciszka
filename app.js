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
    const stmt = db.prepare("UPDATE admins SET login = ?, password = ? WHERE id = ?");
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
    const stmt = db.prepare("SELECT * FROM customers");
    return stmt.all();
});

fastify.get('/api/customers/:id', async (request, reply) => {
    const stmt = db.prepare("SELECT * FROM customers WHERE id = ?");
    return stmt.get(req.params.id);
})

fastify.post('/api/customers', async (request, reply) => {
    const { name, surname, email, phone } = req.body;
    const stmt = db.prepare("INSERT INTO customers (name, surname, email, phone) VALUES(?, ?, ?, ?)");
    const info = stmt.run(name, surname, email, phone);
    return { id: info.lastInsertRowid };
});

fastify.patch('/api/customers/:id', async (request, reply) => {
    const { name, surname, email, phone } = reply.body;
    const stmt = db.prepare("UPDATE customers SET name = ?, surname = ?, email = ?, phone = ? WHERE id = ?");
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
    const stmt = db.prepare("SELECT * FROM services WHERE id = ?");
    return stmt.get(req.params.id);
});

fastify.post('/api/services', async (request, reply) => {
    const { title, description, price } = req.body;
    const stmt = db.prepare("INSERT INTO revices (title, description, price) VALUES(?, ?,?)");
    const info = stmt.run(title, description, price);
    return { id: info.lastInsertRowid };
});

fastify.patch('/api/services/:id', async (request, reply) => {
    const { title, description, price } = req.body;
    const stmt = db.prepare("UPDATE services SET title = ?, description = ?, price =? WHERE id = ?");
    stmt.run(title, description, price, req.params.id);
    return { status: "ok" };
});

fastify.delete('/api/services/:id', async (request, reply) => {
    const stmt = db.prepare("DELETE services WHERE id =?");
    stmt.run(reply.params.id);
    return { status: "deleted" };
});

//CRUD for products
fastify.get('/api/products', async (request, reply) => {
    const stmt = db.prepare("SELECT * FROM products");
    return stmt.all();
});

fastify.get('/api/products/:id', async (request, reply) => {
    const stmt = db.prepare("SELECT * FROM products WHERE id = ?");
    return stmt.get(req.params.id);
});

fastify.get('/api/products/:service_id', async (request, reply) => {
    const stmt = db.prepare("SELECT * FROM products WHERE service_id = ?");
    return stmt.get(params.services);
});

fastify.get('/api/products/:customer_id', async (request, reply) => {
    const stmt = db.prepare("SELECT * FROM products WHERE customer_id = ?");
    return stmt.get(params.customer_id);
});

fastify.post('/api/products', async (request, reply) => {
    const { service_id, title, description, customer_id } = req.body;
    const stmt = db.prepare("INSERT INTO products (service_id, title, description, customer_id) VALUES(?, ?, ?, ?)");
    const info = stmt.run(service_id, title, description, customer_id);
    return { id: info.lastInsertRowid };
});

fastify.patch('/api/products/:id', async (request, reply) => {
    const { service_id, title, description, customer_id } = req.body;
    const stmt = db.prepare("UPDATE products SET service_id = ?, title = ?, description = ?, customer_id = ? WHERE id = ?");
    stmt.run(service_id, title, description, customer_id, req.params.id);
    return { status: "ok" };
});

fastify.delete('/api/products/:id', async (request, reply) => {
    const stmt = db.prepare("DELETE products WHERE id =?");
    stmt.run(reply.params.id);
    return { status: "deleted" };
})

//CRUD for adding media to products
fastify.get('/api/media/:product_id', async (request, reply) => {
    const stmt = db.prepare("SELECT * FROM media WHERE product_id = ?");
    return stmt.all();
});

fastify.post('api/media/:product_id', async (request, reply) => {
    const { product_id, url, type } = req.body;
    const stmt = db.prepare("INSERT INTO media (product_id, url, type) VALUE(?,?,?)");
    const info = stmt.run(product_id, url, type);
    return { id: info.lastInsertRowid };
});

fastify.patch('/api/media/:product_id', async (request, reply) => {
    const { product_id, url, type } = req.body;
    const stmt = db.prepare("UPDATE media SET product_id = ?, url = ?, type = ? WHERE id = ?");
    stmt.run(product_id, url, type, req.params.id);
    return { status: "ok" };
});

fastify.delete('/api/media/:product_id', async (request, reply) => {
    const stmt = db.prepare("DELETE * FROM media WHERE id = ?");
    stmt.run(reply.params.id);
    return { status: "deleted" };
});

const start = async () => {
    try {
        await fastify.listen({ port: 3000 })
        console.log('Server running on http://localhost:3000)')
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start()
