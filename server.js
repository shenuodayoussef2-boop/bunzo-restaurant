const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// إعداد الاتصال بقاعدة البيانات
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bunzo_db'
});

// التأكد من الاتصال
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL as id ' + db.threadId);
});

// API لإضافة أوردر جديد
app.post('/api/orders', (req, res) => {
    const { customerName, phone, address, total, items } = req.body;

    // 1. إضافة العميل
    const customerQuery = 'INSERT INTO customers (name, phone, address) VALUES (?, ?, ?)';
    db.query(customerQuery, [customerName, phone, address], (err, result) => {
        if (err) return res.status(500).send(err);
        
        const customerId = result.insertId;

        // 2. إضافة الأوردر
        const orderQuery = 'INSERT INTO orders (customer_id, total_price) VALUES (?, ?)';
        db.query(orderQuery, [customerId, total], (err, result) => {
            if (err) return res.status(500).send(err);
            
            const orderId = result.insertId;

            // 3. إضافة محتويات الأوردر (Items)
            const itemQuery = 'INSERT INTO order_items (order_id, item_name, quantity, price) VALUES ?';
            const values = items.map(item => [orderId, item.name, item.quantity, item.price]);
            
            db.query(itemQuery, [values], (err, result) => {
                if (err) return res.status(500).send(err);
                res.status(201).send({ message: 'Order placed successfully!', orderId });
            });
        });
    });
});

// تشغيل السيرفر
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});