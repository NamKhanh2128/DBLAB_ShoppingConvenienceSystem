"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.logger = {
    info: (message, meta) => {
        console.log(`[INFO] ${message}`, meta ? meta : '');
    },
    error: (message, error) => {
        console.error(`[ERROR] ${message}`, error ? error : '');
    },
    warn: (message, meta) => {
        console.warn(`[WARN] ${message}`, meta ? meta : '');
    }
};
