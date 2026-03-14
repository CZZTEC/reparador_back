import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthServiceLocator } from './auth.service.locator';

const router = Router();
let authController: any = null;

// ============================================
// Rate Limiters - Proteção contra brute force
// ============================================

// Login: 5 tentativas a cada 15 minutos
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  standardHeaders: true, // Retorna info do rate-limit nos headers `RateLimit-*`
  legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
  keyGenerator: (req) => {
    // Usar email ou IP como chave
    const email = (req.body as any)?.email || req.ip || 'unknown';
    return email;
  },
  skip: (req) => {
    // Os testes podem ser pulados
    return process.env.NODE_ENV === 'test';
  },
});

// Register: 3 tentativas a cada hora
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 tentativas
  message: 'Muitas tentativas de registro. Tente novamente em 1 hora.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = (req.body as any)?.email || req.ip || 'unknown';
    return email;
  },
  skip: (req) => {
    return process.env.NODE_ENV === 'test';
  },
});

// Forgot Password: 3 emails a cada hora
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 emails
  message: 'Muitos emails de recuperação enviados. Tente novamente em 1 hora.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = (req.body as any)?.email || req.ip || 'unknown';
    return email;
  },
  skip: (req) => {
    return process.env.NODE_ENV === 'test';
  },
});

// Lazy initialization para evitar erro de Firebase não inicializado
function getAuthController() {
  if (!authController) {
    authController = AuthServiceLocator.getInstance().getAuthController();
  }
  return authController;
}

/**
 * POST /auth/register
 * Registrar novo usuário
 */
router.post('/register', registerLimiter, async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, userType } = req.body;

  // Validação básica
  if (!email || !password || !firstName || !lastName || !userType) {
    res.status(400).json({
      success: false,
      message: 'Todos os campos são obrigatórios',
      statusCode: 400,
    });
    return;
  }

  await getAuthController().register(email, password, firstName, lastName, userType, res);
});

/**
 * POST /auth/login
 * Login com email e senha
 */
router.post('/login', loginLimiter, async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      success: false,
      message: 'E-mail e senha são obrigatórios',
      statusCode: 400,
    });
    return;
  }

  await getAuthController().login(email, password, res);
});

/**
 * GET /auth/me
 * Obter dados do usuário atual
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token não fornecido',
        statusCode: 401,
      });
      return;
    }

    // Verificar token e extrair UID
    const admin = require('firebase-admin');
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    await getAuthController().getCurrentUser(uid, res);
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: 'Token inválido',
      statusCode: 401,
    });
  }
});

/**
 * POST /auth/forgot-password
 * Enviar email de redefinição de senha
 */
router.post('/forgot-password', forgotPasswordLimiter, async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({
      success: false,
      message: 'E-mail é obrigatório',
      statusCode: 400,
    });
    return;
  }

  await getAuthController().forgotPassword(email, res);
});

/**
 * POST /auth/logout
 * Realizar logout
 */
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token não fornecido',
        statusCode: 401,
      });
      return;
    }

    const admin = require('firebase-admin');
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    await getAuthController().logout(uid, res);
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: 'Token inválido',
      statusCode: 401,
    });
  }
});

export default router;
