import { Router } from 'express';
import { Routes } from '../interfaces/routes.interface';
import AuthController from '../controllers/auth.controller';
import { signupValidationRules, loginValidationRules } from '../validators/auth.validator';
import validationMiddleware from '../middlewares/validation.middleware';

class AuthRoute implements Routes {
    public path = '/v1/';
    public router = Router();
    public authController = new AuthController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}signup`, signupValidationRules(), validationMiddleware, this.authController.signUp);
        this.router.post(`${this.path}login`, loginValidationRules(), validationMiddleware, this.authController.logIn);
    }
}

export default AuthRoute;
