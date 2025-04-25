const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const moment = require('moment');

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());

const mongoURL = "mongodb+srv://Xuanhoang:180223@cluster0.q77udyv.mongodb.net/myDatabase";
mongoose.connect(mongoURL, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000
}).then(() => {
    console.log("Đã kết nối tới MongoDB");
}).catch((error) => {
    console.log("Lỗi kết nối MongoDB:", error);
});

app.get("/", (req, res) => {
    res.send("Ứng dụng Express đang chạy");
});

const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage: storage });

app.use('/images', express.static('upload/images'));

app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    });
});

const productSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    new_price: {
        type: Number,
        required: true,
    },
    old_price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    available: {
        type: Boolean,
        default: true,
    },
    updated_at: {
        type: String,
    }
});

const Product = mongoose.model("Product", productSchema);

app.post('/addproduct', async (req, res) => {
    let products = await Product.find({}).sort({ id: -1 }).limit(1);

    let id;
    if (products.length > 0) {
        let last_product = products[0];
        id = last_product.id + 1;
    } else {
        id = 1;
    }

    try {
        const product = new Product({
            id: id,
            name: req.body.name,
            image: req.body.image,
            category: req.body.category,
            new_price: req.body.new_price,
            old_price: req.body.old_price,
            quantity: req.body.quantity,
            date: req.body.date,
        });
        await product.save();
        res.json({
            success: true,
            name: req.body.name,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lưu sản phẩm thất bại' });
    }
});

app.post('/removeproduct', async (req, res) => {
    try {
        await Product.findOneAndDelete({ id: req.body.id });
        res.json({
            success: true,
            message: 'Xóa sản phẩm thành công'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Xóa sản phẩm thất bại' });
    }
});

app.get('/allproducts', async (req, res) => {
    try {
        let products = await Product.find({});
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Không thể lấy sản phẩm' });
    }
});

app.put('/updateproduct/:id', async (req, res) => {
    try {
        const { name, image, category, new_price, old_price, quantity } = req.body;
        const updatedProduct = await Product.findOneAndUpdate(
            { id: req.params.id },
            { name, image, category, new_price, old_price, quantity, updated_at: moment().format('DD/MM/YYYY, HH:mm') },
            { new: true, runValidators: true }
        );
        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        }
        res.json({ success: true, message: 'Cập nhật sản phẩm thành công', product: updatedProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Cập nhật sản phẩm thất bại' });
    }
});

const fetchUser = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({ errors: "Vui lòng xác thực bằng token hợp lệ" });
    }
    try {
        const data = jwt.verify(token, 'secret_ecom');
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({ errors: "Vui lòng xác thực bằng token hợp lệ" });
    }
}

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    products: [{ productId: Number, quantity: Number, name: String, price: Number }], 
    amount: Number,
    address: { address: String, note: String },
    buyerInfo: { name: String, phone: String },
    status: { type: String, default: "Pending" },
    paymentMethod: { type: String, required: true }, // Thêm phương thức thanh toán
    updated_at: { type: String }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

app.post('/createorder', fetchUser, async (req, res) => {
    try {
        const order = new Order({
            userId: req.user.id,
            products: req.body.products.map(product => ({
                productId: product.productId,
                quantity: product.quantity,
                name: product.name,
                price: product.price
            })),
            amount: req.body.amount,
            address: req.body.address,
            buyerInfo: req.body.buyerInfo,
            paymentMethod: req.body.paymentMethod // Thêm phương thức thanh toán
        });

        const newOrder = await order.save();
        res.json({ success: true, order: newOrder });
    } catch (error) {
        console.error('Failed to create order:', error);
        res.status(500).json({ success: false, message: 'Failed to create order', error: error.message });
    }
});

app.get('/orders', fetchUser, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).populate('userId', 'name email');
        res.json({ success: true, orders });
    } catch (error) {
        console.error('Failed to fetch orders:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
    }
});

app.get('/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid order ID' });
        }

        const order = await Order.findById(id).populate('userId', 'name email');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({ success: true, order });
    } catch (error) {
        console.error('Failed to fetch order:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch order', error: error.message });
    }
});

app.get('/allorders', async (req, res) => {
    try {
        const orders = await Order.find({}).populate('userId', 'name email');
        res.json({ success: true, orders });
    } catch (error) {
        console.error('Failed to fetch orders:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
    }
});

app.put('/orders/:id', async (req, res) => {
    try {
        const { address, status } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { address, status, updated_at: moment().format('DD/MM/YYYY, HH:mm') },
            { new: true, runValidators: true }
        );
        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }
        res.json({ success: true, message: 'Cập nhật đơn hàng thành công', order: updatedOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Cập nhật đơn hàng thất bại', error: error.message });
    }
});

app.delete('/orders/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }
        res.json({ success: true, message: 'Xóa đơn hàng thành công' });
    } catch (error) {
        res.status (500).json({ success: false, message: 'Xóa đơn hàng thất bại', error: error.message });
    }
});

app.get('/user', fetchUser, async (req, res) => {
    try {
        const user = await Users.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch user data' });
    }
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    cartData: {
        type: Object,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: String,
    },
});
const Users = mongoose.model('Users', userSchema);

app.post('/signup', async (req, res) => {
    try {
        let check = await Users.findOne({ email: req.body.email });
        if (check) {
            return res.status(400).json({ success: false, errors: "Existing user found with same email address" });
        }

        let cart = {};
        for (let i = 0; i < 300; i++) {
            cart[i] = 0;
        }

        const user = new Users({
            name: req.body.username,
            email: req.body.email,
            password: req.body.password,
            cartData: cart,
        });

        await user.save();

        const data = {
            user: {
                id: user.id
            }
        };
        const token = jwt.sign(data, 'secret_ecom');
        res.json({ success: true, token });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Đăng ký người dùng thất bại' });
    }
})

app.post('/login', async (req, res) => {
    let user = await Users.findOne({ email: req.body.email });
    if (user) {
        const passCompare = req.body.password === user.password;
        if (passCompare) {
            const data = {
                user: {
                    id: user.id
                }
            }
            const token = jwt.sign(data, 'secret_ecom');
            res.json({ success: true, token });
        } else {
            res.json({ success: false, errors: "Wrong password" });
        }
    } else {
        res.json({ success: false, errors: "Wrong Email" });
    }
});

app.get('/users', async (req, res) => {
    try {
        const users = await Users.find({});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
});

app.delete('/users/:id', async (req, res) => {
    try {
        await Users.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
});

app.put('/users/:id', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const updatedUser = await Users.findByIdAndUpdate(
            req.params.id,
            { 
                name, 
                email, 
                password,
                updated_at: moment().format('DD/MM/YYYY, HH:mm')
            },
            { new: true, runValidators: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update user' });
    }
});

app.get('/newcollections', async (req, res) => {
    try {
        let products = await Product.find({});
        let newcollection = products.slice(-8);
        res.send(newcollection);
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});

app.get('/popularinwomen', async (req, res) => {
    try {
        let products = await Product.find({ category: "women" });
        let popular_in_women = products.slice(0, 4);
        res.send(popular_in_women);
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});

app.post('/addtocart', fetchUser, async (req, res) => {
    let userData = await Users.findOne({ _id: req.user.id });
    userData.cartData[req.body.itemId] += 1;
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
    res.json({ success: true, message: "Added" });
})

app.post('/removefromcart', fetchUser, async (req, res) => {
    let userData = await Users.findOne({ _id: req.user.id });
    if (userData.cartData[req.body.itemId] > 0) {
        userData.cartData[req.body.itemId] -= 1;
        await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
        res.json({ success: true, message: "Removed" });
    } else {
        res.json({ success: false, message: "Item not in cart" });
    }
})

app.post('/getcart', fetchUser, async (req, res) => {
    let userData = await Users.findOne({ _id: req.user.id });
    res.json(userData.cartData);
})

app.listen(port, (error) => {
    if (!error) {
        console.log("Máy chủ đang chạy trên cổng " + port);
    } else {
        console.log("Lỗi: " + error);
    }
});
