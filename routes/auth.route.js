import { Router } from "express";
import {
    signUpController,
    signInController,
    getSessionController,
    verifyEmailController,
    resendEmailOtpController,
    verify2faController,
    requestEnable2faController,
    confirmEnable2faController,
    disable2faController,
    forgotPasswordController,
    resetPasswordController,
    logoutController,
} from "../controller/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.post('/signup', signUpController);
authRouter.post('/verify-email', verifyEmailController);
authRouter.post('/resend-email-otp', resendEmailOtpController);

authRouter.post('/signin', signInController);
authRouter.post('/2fa/verify', verify2faController);

authRouter.post('/2fa/enable', requireAuth, requestEnable2faController);
authRouter.post('/2fa/enable/confirm', requireAuth, confirmEnable2faController);
authRouter.post('/2fa/disable', requireAuth, disable2faController);

authRouter.post('/forgot-password', forgotPasswordController);
authRouter.post('/reset-password', resetPasswordController);

authRouter.get('/session', requireAuth, getSessionController);
authRouter.post('/logout', requireAuth, logoutController);

export default authRouter;