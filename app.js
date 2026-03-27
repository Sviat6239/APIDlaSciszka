import Fastify from "fastify";
import db from "./db";
import bcrypt from "bcrypt";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";

const fastify = Fastify({
    logger: true
})

fastify.register(fastifyCookie);

fastify.register(fastifyJwt, {
    secret: "SUPER_SECRET_KEY",
    cookie: {
        cookieName: 'token',
        signed: false
    }
});

//Login
fastify.post('/api/login', async (request, reply) => {
    const { login, password } = request.body;
    if (!login || !password) {
        return reply.code(400).send({ error: "Login and password required" });
    }

    const stmt = db.prepare("SELECT * FROM admins WHERE login = ?");
    const admin = stmt.get(login);

    if (!admin) {
        return reply.code(401).send({ error: "Invalid login or password!" });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
        return reply.code(401).send({ error: "Invalid login or password!" });
    }

    const token = fastify.jwt.sign({ id: admin.id, login: admin.login }, { expiresIn: "2h" });

    reply
        .setCookie('token', token, { httpOnly: true })
        .send({ token });
});

//Logout
fastify.post('/api/logout', async (request, reply) => {
    reply.clearCookie('token').send({ status: "Logged out" });
});

//Middleware
fastify.decorate('authenticate', async (request, reply) => {
    try {
        await request.jwtVerify();
    } catch (err) {
        reply.code(401).send({ error: "Unauthorized" });
    }
});

//CRUD for admins

//admins get method
fastify.get('/api/admins', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const stmt = db.prepare("SELECT * FROM admins");
    return stmt.all();
});

//admins by id get method
fastify.get('/api/admins/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const stmt = db.prepare("SELECT * FROM admins WHERE id = ?");
    return stmt.get(request.params.id);
});

//admins post method
fastify.post('/api/admin', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { login, password } = request.body;

    if (!login || !password) {
        return reply.code(400).send({ error: "Login and password required" });
    }

    const hashed = await bcrypt.hash(password, 12);
    const stmt = db.prepare("INSERT INTO admins (login, password) VALUES (?, ?)");
    const info = stmt.run(login, hashed);

    return { id: info.lastInsertRowid };
});

//admins by id put method
fastify.put('/api/admins/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { login, password } = require.body;
    const id = require.params.id;

    const fields = [];
    const params = [];

    if (login) {
        fields.push("login = ?");
        params.push(login);
    }

    if (password) {
        const hashed = await bcrypt.hash(password, 12);
        fields.push("password = ?");
        params.push(hashed);
    }

    if (fields.length === 0) {
        return reply.code(400).send({ error: "Nothing to update" });
    }

    const stmt = db.prepare(`UPDATE admins SET ${fields.join(", ")} WHERE id = ?`);
    params.push(id);

    const info = stmt.run(...params);

    if (info.length === 0) {
        return reply.code(404).send({ error: "Admin not found" });
    }

    return { status: "ok" };

});

//admins by id patch method
fastify.patch('/api/admins/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { login, password } = request.body;
    const id = request.params.id;

    const fields = [];
    const params = [];

    if (login) {
        fields.push("login = ?");
        params.push(login);
    }

    if (password) {
        const hashed = await bcrypt.hash(password, 12);
        fields.push("password = ?");
        params.push(hashed);
    }

    if (fields.length === 0) {
        return reply.code(400).send({ error: "Nothing to update" });
    }

    const stmt = db.prepare(`UPDATE admins SET ${fields.join(", ")} WHERE id = ?`);
    params.push(id);

    const info = stmt.run(...params);

    if (info.changes === 0) {
        return reply.code(404).send({ error: "Admin not found" });
    }

    return { status: "ok" };
});

//admins by id delete method
fastify.delete("/api/admins/:id", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const id = request.params.id;
    const stmt = db.prepare("DELETE FROM admins WHERE id = ?");
    const info = stmt.run(request.params.id);

    if (info.changes === 0) {
        return reply.code(404).send({ error: "Admin not found" });
    }

    return { status: "deleted" };
});

//CRUD for customers

//customers get method
fastify.get('/api/customers', async (request, reply) => {
    const stmt = db.prepare("SELECT * FROM customers");
    return stmt.all();
});

//customers by id get method
fastify.get('/api/customers/:id', async (request, reply) => {
    const stmt = db.prepare("SELECT * FROM customers WHERE id = ?");
    return stmt.get(request.params.id);
})

//customers post method
fastify.post('/api/customers', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { name, surname, email, phone } = request.body;

    if (!name || !surname || !email || !phone) {
        return reply.code(400).send({ error: "Name, surname, email and phone are required" });
    }

    const stmt = db.prepare("INSERT INTO customers (name, surname, email, phone) VALUES(?, ?, ?, ?)");
    const info = stmt.run(name, surname, email, phone);

    return { id: info.lastInsertRowid };
});

//customers by id put method
fastify.put('/api/customers/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { name, surname, email, phone } = request.body;
    const id = request.params.id;

    const fields = [];
    const params = [];

    if (name) {
        fields.push("name =  ?");
        params.push(name);
    }

    if (surname) {
        fields.push("surname = ?");
        params.push(surname);
    }

    if (email) {
        fields.push("email = ?");
        params.push(email);
    }

    if (phone) {
        fields.push("phone = ?");
        params.push(phone);
    }

    if (fields.length === 0) {
        return code(400).send({ error: "Nothing to update" });
    }

    const stmt = db.prepare(`UPDATE customers SET ${fields.join(", ")} WHERE id = ?`);
    params.push(id);

    const info = stmt.run(...params);

    if (info.changes === 0) {
        return reply.code(404).send({ error: "Customer not found" });
    }

    return { status: "ok" };
});

//customers by id patch method
fastify.patch('/api/customers/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { name, surname, email, phone } = request.body;
    const id = request.params.id;

    const fields = [];
    const params = [];

    if (name) {
        fields.push("name = ?");
        params.push(name);
    }

    if (surname) {
        fields.push("surname = ?");
        params.push(surname);
    }

    if (email) {
        fields.push("email = ?");
        params.push(email);
    }

    if (phone) {
        fields.push("phone = ?");
        params.push(phone);
    }

    if (fields.length === 0) {
        return reply.code(400).send({ error: "Nothing to update" });
    }

    const stmt = db.prepare(`UPDATE customers SET ${fields.join(", ")} WHERE id = ?`);
    params.push(id);

    const info = stmt.run(...params);

    if (info.changes === 0) {
        return reply.code(404).send({ error: "Customer not found" });
    }

    return { status: "ok" };
});

//customers by id delete method
fastify.delete('/api/customers/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const id = request.params.id;
    const stmt = db.prepare("DELETE FROM customers WHERE id = ?");
    const info = stmt.run(request.params.id);

    if (info.changes === 0) {
        return reply.code(404).send({ error: "Customer not found" });
    }

    return { status: "deleted" };
});

//CRUD for services

//services get method
fastify.get('/api/services', async (request, reply) => {
    const stmt = db.prepare("SELECT * FROM services");
    return stmt.all();
});

//services by id get method
fastify.get('/api/services/:id', async (request, reply) => {
    const stmt = db.prepare("SELECT * FROM services WHERE id = ?");
    return stmt.get(request.params.id);
});

//services post method
fastify.post('/api/services', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { title, description, price } = request.body;

    if (!title || !description || !price) {
        return reply.code(400).send({ error: "Title, description and price are required" });
    }

    const stmt = db.prepare("INSERT INTO services (title, description, price) VALUES(?, ?, ?)");
    const info = stmt.run(title, description, price);

    return { id: info.lastInsertRowid };
});

//services by id put method
fastify.put('/api/services/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { title, description, price } = request.body;
    const id = request.params.id;

    const fields = [];
    const params = [];

    if (title) {
        fields.push("title = ?");
        params.push(title);
    }

    if (description) {
        fields.push("description = ?");
        params.push(description);
    }

    if (price) {
        fields.push("price = ?");
        params.push(price);
    }

    if (fields.length === 0) {
        return reply.code(400).send({ error: "Nothing to update" });
    }

    const stmt = db.prepare(`UPDATE services SET ${fields.join(", ")} WHERE id = ?`);
    params.push(id);
    const info = stmt.run(...params);

    if (info.chnges === 0) {
        return reply.code(404).send({ error: "Services not found" });
    }

    return { status: "ok" };
});

//services by id patch method
fastify.patch('/api/services/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { title, description, price } = request.body;
    const id = request.params.id;

    const fields = [];
    const params = [];

    if (title) {
        fields.push("title = ?");
        params.push(title);
    }

    if (description) {
        fields.push("description = ?");
        params.push(description);
    }

    if (price) {
        fields.push("price = ?");
        params.push(price);
    }

    if (fields.length === 0) {
        return reply.code(400).send({ error: "Nothing to update" });
    }

    const stmt = db.prepare(`UPDATE services SET ${fields.join(", ")} WHERE id = ?`);
    params.push(id);
    const info = stmt.run(...params);

    if (info.changes === 0) {
        return reply.code(404).send({ error: "Service not found" });
    }

    return { status: "ok" };
});

//services by id delete method
fastify.delete('/api/services/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const id = request.params.id;
    const stmt = db.prepare("DELETE FROM services WHERE id =?");
    const info = stmt.run(request.params.id);

    if (info.changes === 0) {
        return reply.code(404).send({ error: "Service not found" });
    }

    return { status: "deleted" };
});

//CRUD for products

//products get method
fastify.get('/api/products', async (request, reply) => {
    const stmt = db.prepare("SELECT * FROM products");
    return stmt.all();
});

//products by id get method
fastify.get('/api/products/:id', async (request, reply) => {
    const stmt = db.prepare("SELECT * FROM products WHERE id = ?");
    return stmt.get(request.params.id);
});

//products by service_id get method
fastify.get('/api/products/by-service/:service_id', async (request, reply) => {
    const stmt = db.prepare("SELECT * FROM products WHERE service_id = ?");
    return stmt.get(request.params.service_id);
});

//products by customer_id get method
fastify.get('/api/products/by-customer/:customer_id', async (request, reply) => {
    const stmt = db.prepare("SELECT * FROM products WHERE customer_id = ?");
    return stmt.all(request.params.customer_id);
});

//products post method
fastify.post('/api/products', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { service_id, title, description, customer_id } = request.body;

    if (!service_id || !title || !description || !customer_id) {
        return reply.code(400).send({ error: "Service_id, title, description and customer_id are required" });
    }

    const stmt = db.prepare("INSERT INTO products (service_id, title, description, customer_id) VALUES(?, ?, ?, ?)");
    const info = stmt.run(service_id, title, description, customer_id);

    return { id: info.lastInsertRowid };
});

//products by id put method
fastify.put('/api/products/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { service_id, title, description, customer_id } = request.body;
    const id = request.params.id;

    const fields = [];
    const params = [];

    if (service_id) {
        fields.push("service_id = ?");
        params.push(service_id);
    }

    if (title) {
        fields.push("title = ?");
        params.push(title);
    }

    if (description) {
        fields.push("description = ?");
        params.push(description);
    }

    if (customer_id) {
        fields.push("customer_id = ?");
        params.push(customer_id);
    }

    if (fields.length === 0) {
        return reply.code(400).send({ error: "Nothing to update" });
    }

    const stmt = db.prepare(`UPDATE services SET ${fields.join(", ")} WHERE id = ?`);
    params.push(id);

    const info = stmt.run(...params);
    if (info.chanes === 0) {
        return reply.code(404).send({ error: "Product not found" });
    }
    return { status: "ok" };
})

//products by id patch method
fastify.patch('/api/products/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { service_id, title, description, customer_id } = request.body;
    const id = request.params.id;

    const fields = [];
    const params = [];

    if (service_id) {
        fields.push("service_id = ?");
        params.push(service_id);
    }

    if (title) {
        fields.push("title = ?");
        params.push(title);
    }

    if (description) {
        fields.push("description = ?");
        params.push(description);
    }

    if (customer_id) {
        fields.push("customer_id = ?");
        params.push(customer_id);
    }

    if (fields.length === 0) {
        return reply.code(400).send({ error: "Nothing to update" });
    }

    const stmt = db.prepare(`UPDATE products SET ${fields.join(", ")} WHERE id = ?`);
    params.push(id);

    const info = stmt.run(...params);

    if (info.changes === 0) {
        return reply.code(404).send({ error: "Product not found" });
    }

    return { status: "ok" };
});

//products by id delete method
fastify.delete('/api/products/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const id = request.params.id;
    const stmt = db.prepare("DELETE FROM products WHERE id =?");
    const info = stmt.run(request.params.id);

    if (info.changes === 0) {
        return reply.code(404).send({ error: "Product not found" });
    }

    return { status: "deleted" };
});

//CRUD for adding media to products

//media by product_id get method
fastify.get('/api/media/:product_id', async (request, reply) => {
    const stmt = db.prepare("SELECT * FROM media WHERE product_id = ?");
    return stmt.all(request.params.product_id);
});

//media post method
fastify.post('/api/media', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { product_id, url, type } = req.body;

    if (!product_id || !url || !type) {
        return reply.code(400).send({ error: "Product_id, url and type are required" });
    }

    const stmt = db.prepare("INSERT INTO media (product_id, url, type) VALUEs(?,?,?)");
    const info = stmt.run(product_id, url, type);

    return { id: info.lastInsertRowid };
});

//media by products_id put method
fastify.put('/api/media/:product_id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { product_id, url, type } = request.body;
    const id = request.params.id;

    const fields = [];
    const params = [];

    if (products_id) {
        fields.push("product_id = ?");
        params.push(product_id);
    }

    if (url) {
        fields.push("url = ?");
        params.push(url);
    }

    if (type) {
        fields.push("type = ?");
        params.push(type);
    }

    if (fields.leght === 0) {
        return reply.code(400).send({ error: "Nothing to update" });
    }

    const stmt = db.prepare(`UPDATE media SET ${fields.join(", ")} WHERE id = ?`);
    params.push(id);

    const info = stmt.run(...params);

    if (info.changes === 0) {
        return reply.code(404).send({ error: "Media not found" });
    }

})

//media by product_id patch method
fastify.patch('/api/media/:product_id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { product_id, url, type } = reqгuest.body;
    const id = request.params.id;

    const fields = [];
    const params = [];

    if (product_id) {
        fields.push("product_id = ?");
        params.push(product_id);
    }

    if (url) {
        fields.push("url = ?");
        params.push(url);
    }

    if (type) {
        fields.push("type = ?");
        params.push(type);
    }

    if (fields.length === 0) {
        return reply.code(400).send({ error: "Nothing to update" });
    }

    const stmt = db.prepare(`UPDATE media SET ${fields.join(", ")} WHERE id = ?`);
    params.push(id);

    const info = stmt.run(...params);

    if (info.changes === 0) {
        return reply.code(404).send({ error: "Media not found" });
    }

    return { status: "ok" };
});

//media by products_id delete method 
fastify.delete('/api/media/:product_id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const id = request.params.id;
    const stmt = db.prepare("DELETE FROM media WHERE id = ?");
    const info = stmt.run(request.params.id);

    if (info.changes === 0) {
        return reply.code(404).send({ error: "Media not found" });
    }

    return { status: "deleted" };
});

//start web server
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
