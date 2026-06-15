"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const response_1 = require("../utils/response");
const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            if (error && error.errors) {
                const errors = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                return (0, response_1.createError)(res, 'Validation failed', 400, errors);
            }
            next(error);
        }
    };
};
exports.validateRequest = validateRequest;
