import { Router, Request, Response } from 'express';
import { FirebaseConfig } from '../../config/firebase';
import { AppLogger } from '../../core/utils/logger';

const router = Router();

const VALID_PLANS = ['basic', 'premium'];

/**
 * POST /plans/purchase
 * Simula a compra de um plano — escreve a subscription do lado do servidor
 * com privilégios de Admin SDK (não pode ser adulterado pelo cliente).
 *
 * Body: { planType: 'basic' | 'premium' }
 * Header: Authorization: Bearer <Firebase ID Token>
 */
router.post('/purchase', async (req: Request, res: Response) => {
  try {
    // ── 1. Verificar autenticação ──────────────────────────────────────────
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticação não fornecido.',
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    let uid: string;
    try {
      // checkRevoked=false: não verifica revogação (desnecessário no emulador)
      const decoded = await FirebaseConfig.getAuth().verifyIdToken(idToken, false);
      uid = decoded.uid;
    } catch (tokenErr: any) {
      console.error('[plans/purchase] verifyIdToken failed:', tokenErr?.message ?? tokenErr);
      return res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado.',
      });
    }

    // ── 2. Validar plano ───────────────────────────────────────────────────
    const { planType } = req.body as { planType?: string };
    if (!planType || !VALID_PLANS.includes(planType)) {
      return res.status(400).json({
        success: false,
        message: 'Plano inválido. Use "basic" ou "premium".',
      });
    }

    // ── 3. Montar dados da subscription ───────────────────────────────────
    const db = FirebaseConfig.getFirestore();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dias

    // ── 4. Batch write: users + professionals ──────────────────────────────
    const batch = db.batch();

    // Escreve subscription + marca perfil profissional no users doc
    const userRef = db.collection('users').doc(uid);
    batch.update(userRef, {
      'subscription.type': planType,
      'subscription.status': 'active',
      'subscription.startedAt': now,
      'subscription.expiresAt': expiresAt,
      'subscription.autoRenew': true,
      'subscription.paymentMethod': 'simulated',
      'profiles.isProfessional': true,
      'updatedAt': now,
    });

    // Cria ou atualiza perfil na coleção professionals (merge = não sobrescreve dados existentes)
    const profRef = db.collection('professionals').doc(uid);
    batch.set(profRef, {
      'isPremium': planType === 'premium',
      'subscriptionType': planType,
      'subscriptionExpiresAt': expiresAt,
      'updatedAt': now,
    }, { merge: true });

    await batch.commit();

    AppLogger.info('PLAN_PURCHASED', { uid, planType });

    const planLabel = planType === 'premium' ? 'Pro' : 'Básico';
    return res.json({
      success: true,
      message: `Plano ${planLabel} ativado com sucesso!`,
      data: {
        planType,
        status: 'active',
        expiresAt: expiresAt.toISOString(),
      },
    });
  } catch (error: any) {
    AppLogger.error('PLAN_PURCHASE_ERROR', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erro interno ao processar o plano.',
    });
  }
});

/**
 * GET /plans/status
 * Retorna o status do plano do usuário autenticado
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token não fornecido.' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    let uid: string;
    try {
      const decoded = await FirebaseConfig.getAuth().verifyIdToken(idToken, false);
      uid = decoded.uid;
    } catch (tokenErr: any) {
      console.error('[plans/status] verifyIdToken failed:', tokenErr?.message ?? tokenErr);
      return res.status(401).json({ success: false, message: 'Token inválido.' });
    }

    const db = FirebaseConfig.getFirestore();
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }

    const subscription = userDoc.data()?.subscription ?? null;
    const isActive =
      subscription?.status === 'active' &&
      subscription?.expiresAt != null &&
      subscription.expiresAt.toDate() > new Date();

    return res.json({
      success: true,
      data: {
        hasActivePlan: isActive,
        planType: subscription?.type ?? 'free',
        status: subscription?.status ?? 'none',
        expiresAt: subscription?.expiresAt?.toDate()?.toISOString() ?? null,
      },
    });
  } catch (error: any) {
    AppLogger.error('PLAN_STATUS_ERROR', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
