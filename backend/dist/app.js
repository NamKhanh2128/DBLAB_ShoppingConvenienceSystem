"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = require("./core/middleware/error.middleware");
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: env_1.env.CLIENT_URL,
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Custom Cookie Parser Middleware (Không dùng thư viện ngoài)
app.use((req, res, next) => {
    const list = {};
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
        cookieHeader.split(';').forEach((cookie) => {
            let [name, ...rest] = cookie.split('=');
            name = name.trim();
            if (!name)
                return;
            const val = rest.join('=').trim();
            if (!val)
                return;
            list[name] = decodeURIComponent(val);
        });
    }
    req.cookies = list;
    next();
});
// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Backend is running smoothly' });
});
// API Routes
app.use('/api/v1', routes_1.default);
// Error Handling
app.use(error_middleware_1.errorMiddleware);
exports.default = app;
