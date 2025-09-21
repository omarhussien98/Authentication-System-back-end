// استدعاء المكتبات
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// تحقق من اتصال الخادم
async function checkServer() {
    try {
        const response = await fetch(API_BASE_URL + '/api/health');
        const data = await response.json();
        console.log('✅ الخادم يعمل:', data);
    } catch (error) {
        console.error('❌ الخادم لا يستجيب:', error);
    }
}

checkServer();

// ⭐⭐ الاتصال بقاعدة البيانات MongoDB - تم التعديل إلى رابطك ⭐⭐
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://omaranr9348_db_user:<pf6Me0twRTnsAt3e>@cluster0.bbnxyry.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('✅ تم الاتصال بقاعدة MongoDB بنجاح'))
  .catch(err => console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err));

// تعريف Schema للمستخدمين
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

// Model للمستخدم
const User = mongoose.model('User', userSchema);

// Middleware للتحقق من التوكن
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'مطلوب رمز الدخول' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'رمز الدخول غير صالح' });
        }
        req.user = user;
        next();
    });
}

// ✅ مسار التسجيل
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
        }

        // تحقق من البريد الإلكتروني
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'صيغة البريد الإلكتروني غير صحيحة' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'كلمة المرور يجب أن تكون至少 6 أحرف' });
        }

        // تحقق من وجود المستخدم
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'هذا البريد الإلكتروني مسجل مسبقاً' });
        }

        // تشفير كلمة المرور
        const hashedPassword = await bcrypt.hash(password, 10);

        // إنشاء المستخدم
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        // إنشاء توكن
        const token = jwt.sign({ userId: newUser._id, email }, JWT_SECRET, { expiresIn: '24h' });

        res.status(201).json({
            message: 'تم إنشاء المستخدم بنجاح',
            token,
            user: { id: newUser._id, name, email }
        });
    } catch (error) {
        console.error('Error in registration:', error);
        res.status(500).json({ error: 'خطأ داخلي في الخادم' });
    }
});

// ✅ مسار تسجيل الدخول
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
        }

        // البحث عن المستخدم
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحين' });
        }

        // تحقق من كلمة المرور
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحين' });
        }

        // إنشاء توكن
        const token = jwt.sign({ userId: user._id, email }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            message: 'تم تسجيل الدخول بنجاح',
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ error: 'خطأ داخلي في الخادم' });
    }
});

// ✅ مسار للتحقق من التوكن
app.get('/api/verify', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'المستخدم غير موجود' });
        }
        res.json({ user });
    } catch (error) {
        console.error('Error in token verification:', error);
        res.status(500).json({ error: 'خطأ داخلي في الخادم' });
    }
});

// ⭐⭐ إضافة جديدة: التحقق من صحة الخادم وقاعدة البيانات ⭐⭐
app.get('/api/health', async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState === 1 ? 'متصل' : 'غير متصل';
        
        res.json({
            status: '✅ الخادم يعمل بشكل طبيعي',
            database: dbStatus,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        res.status(500).json({ error: 'خطأ في التحقق من صحة الخادم' });
    }
});

// خدمة الملفات الثابتة
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// تشغيل الخادم
app.listen(PORT, () => {
    console.log(`🚀 الخادم يعمل على المنفذ ${PORT}`);
    console.log(`http://localhost:${PORT}/api/health`);
});