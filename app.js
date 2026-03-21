import Fastify from "fastify";
import db from "./db";
import bcrypt from "bcrypt";

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
    return stmt.get(request.params.id);
});

fastify.post('/api/admin', async (request, reply) => {
    const { login, password } = request.body;

    if (!login || !password) {
        return reply.code(400).send({error: "Login and password required"});
    }

    const hashed = await bcrypt.hash(password, 12);
    const stmt = db.prepare("INSERT INTO admins (login, password) VALUES (?, ?)");
    const info = stmt.run(login, hashed);

    return { id: info.lastInsertRowid };
});

fastify.patch('/api/admins/:id', async (request, reply) => {
    const { login, password } = request.body;
    const id = request.params.id;

    const fields = [];
    const params = [];

    if (login){
        fields.push("login = ?");
        params.push("password = ?");
    }

    if (password){
        const hashed = await bcrypt.hash(password, 12);
        fields.push("password = ?");
        params.push(hashed);
    }

    if(fields.length === 0){
        return reply.code(400).send({error: "Nothing to update"});
    }

    const stmt = db.prepare(`UPDATE admins SET ${fields.join(", ")} WHERE id = ?`);
    params.push(id);

    const info = stmt.run(...params);

    if (info.changes === 0){
        return reply.code(404).send({error: "Admin not found"});
    }

    return { status: "ok" };
});

fastify.delete("/api/admins/:id", async (request, reply) => {
    const id = request.params.id;
    const stmt = db.prepare("DELETE FROM admins WHERE id = ?");
    info = stmt.run(request.params.id);

    if (info.changes === 0){
        return reply.code(404).send({error: "Admin not found"});
    }

    return { status: "deleted" };
})

//CRUD for customers
fastify.get('/api/customers', async (request, reply) => {
    const stmt = db.prepare("SELECT * FROM customers");
    return stmt.all();
});

fastify.get('/api/customers/:id', async (request, reply) => {
    const stmt = db.prepare("SELECT * FROM customers WHERE id = ?");
    return stmt.get(request.params.id);
})

fastify.post('/api/customers', async (request, reply) => {
    const { name, surname, email, phone } = request.body;

    if(!name || !surname || !email || !phone){
        return reply.code(400).send({error: "Name, surname, email and phone are required"});
    }

    const stmt = db.prepare("INSERT INTO customers (name, surname, email, phone) VALUES(?, ?, ?, ?)");
    const info = stmt.run(name, surname, email, phone);

    return { id: info.lastInsertRowid };
});

fastify.patch('/api/customers/:id', async (request, reply) => {
    const { name, surname, email, phone } = request.body;
    const id = request.params.id;

    const fields = [];
    const params = [];

    if (name){
        fields.push("name = ?");
        params.push(name);
    }

    if (surname){
        fields.push("surname = ?");
        params.push(surname);
    }

    if (email){
        fields.push("email = ?");
        params.push(email);
    }

    if (phone){
        fields.push("phone = ?");
        params.push(email);
    }

    if(fields.length === 0){
        return reply.code(400).send({error: "Noting to update"});
    }

    const stmt = db.prepare(`UPDATE customers SET ${fields.join(", ")} WHERE id = ?`);
    params.push(id);

    const info = stmt.run(...params);

    if (info.changes === 0){
        return reply.code(404).send({error: "Customer not found"});
    }

    return { status: "ok" };
});

fastify.delete('/api/customers/:id', async (request, reply) => {
    const id = request.params.id;
    const stmt = db.prepare("DELETE FROM customers WHERE id = ?");
    info = stmt.run(request.params.id);

    if(info.changes === 0){
        return reply.code(404).send({error: "Customer not found"});
    }

    return { status: "deleted" };
});

//CRUD for services
fastify.get('/api/services', async (request, reply) => {
    const stmt = db.prepare("SELECT * FROM services");
    return stmt.all();
});

fastify.get('/api/services/:id', async (request, reply) => {
    const stmt = db.prepare("SELECT * FROM services WHERE id = ?");
    return stmt.get(request.params.id);
});

fastify.post('/api/services', async (request, reply) => {
    const { title, description, price } = request.body;

    if (!title || !description || !price){
        return reply.code(400).send({error: "Title, desription and price are required"});
    }

    const stmt = db.prepare("INSERT INTO services (title, description, price) VALUES(?, ?, ?)");
    const info = stmt.run(title, description, price);

    return { id: info.lastInsertRowid };
});

fastify.patch('/api/services/:id', async (request, reply) => {
    const { title, description, price } = request.body;
    const id = request.params.id;

    const fields = [];
    const params = [];

    if (title){
        fields.push("title = ?");
        params.push(title);
    }

    if (description){
        fields.push("description = ?");
        params.push(description);
    }

    if(price){
        fields.push("price = ?");
        params.push(price);
    }

    const stmt = db.prepare(`UPDATE services SET ${fields.join(", ")} WHERE id = ?`);
    params.push(id);
    const info = stmt.run(...params);

    if (info.changes === 0){
        return reply.code(404).send({error: "Service not found"});
    }

    return { status: "ok" };
});

fastify.delete('/api/services/:id', async (request, reply) => {
    const id = request.params.id;
    const stmt = db.prepare("DELETE FROM services WHERE id =?");
    info = stmt.run(request.params.id);

    if(info.changes === 0){
        return reply.code(404).send({error: "Service not found"});
    }

    return { status: "deleted" };
});

//CRUD for products
fastify.get('/api/products', async (request, reply) => {
    const stmt = db.prepare("SELECT * FROM products");
    return stmt.all();
});

fastify.get('/api/products/:id', async (request, reply) => {
    const stmt = db.prepare("SELECT * FROM products WHERE id = ?");
    return stmt.get(request.params.id);
});

fastify.get('/api/products/by-service/:service_id', async (request, reply) => {
    const stmt = db.prepare("SELECT * FROM products WHERE service_id = ?");
    return stmt.get(request.params.service_id);
});

fastify.get('/api/products/by-customer/:customer_id', async (request, reply) => {
    const stmt = db.prepare("SELECT * FROM products WHERE customer_id = ?");
    return stmt.all(request.params.customer_id);
});

fastify.post('/api/products', async (request, reply) => {
    const { service_id, title, description, customer_id } = request.body;
    const stmt = db.prepare("INSERT INTO products (service_id, title, description, customer_id) VALUES(?, ?, ?, ?)");
    const info = stmt.run(service_id, title, description, customer_id);
    return { id: info.lastInsertRowid };
});

fastify.patch('/api/products/:id', async (request, reply) => {
    const { service_id, title, description, customer_id } = request.body;
    const stmt = db.prepare("UPDATE products SET service_id = ?, title = ?, description = ?, customer_id = ? WHERE id = ?");
    stmt.run(service_id, title, description, customer_id, request.params.id);
    return { status: "ok" };
});

fastify.delete('/api/products/:id', async (request, reply) => {
    const stmt = db.prepare("DELETE FROM products WHERE id =?");
    stmt.run(request.params.id);
    return { status: "deleted" };
})

//CRUD for adding media to products
fastify.get('/api/media/:product_id', async (request, reply) => {
    const stmt = db.prepare("SELECT * FROM media WHERE product_id = ?");
    return stmt.all(request.params.product_id);
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
    stmt.run(product_id, url, type, request.params.id);
    return { status: "ok" };
});

fastify.delete('/api/media/:product_id', async (request, reply) => {
    const stmt = db.prepare("DELETE * FROM media WHERE id = ?");
    stmt.run(request.params.id);
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
