require('dotenv').config();

exports.port = process.argv[2] || process.env.PORT || 8080;
exports.dbUrl = process.env.DATABASE_URL;
exports.secret = process.env.JWT_SECRET || 'adminsecret';
exports.adminEmail = process.env.ADMIN_EMAIL || 'admin@admin.com';
exports.adminPassword = process.env.ADMIN_PASSWORD || '123456';

