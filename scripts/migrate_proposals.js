// Script para migrar propostas antigas e adicionar clientId
// Uso: node migrate_proposals.js

const admin = require('firebase-admin');
const serviceAccount = require('../firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = admin.firestore();

async function migrateProposals() {
  console.log('🔄 Iniciando migração de propostas...\n');

  try {
    // 1. Buscar todas as propostas
    const proposalsSnapshot = await db.collection('proposals').get();
    console.log(`📊 Total de propostas encontradas: ${proposalsSnapshot.size}\n`);

    let updated = 0;
    let errors = 0;
    let skipped = 0;

    // 2. Para cada proposta
    for (const proposalDoc of proposalsSnapshot.docs) {
      const proposal = proposalDoc.data();
      const proposalId = proposalDoc.id;

      try {
        // Verificar se já tem clientId
        if (proposal.clientId) {
          console.log(`⏭️  Proposta ${proposalId}: já tem clientId (${proposal.clientId})`);
          skipped++;
          continue;
        }

        // Verificar se tem demandId
        if (!proposal.demandId) {
          console.log(`❌ Proposta ${proposalId}: não tem demandId!`);
          errors++;
          continue;
        }

        // 3. Buscar a demanda para pegar clientId
        const demandDoc = await db.collection('demands').doc(proposal.demandId).get();

        if (!demandDoc.exists) {
          console.log(`⚠️  Proposta ${proposalId}: demanda ${proposal.demandId} não existe!`);
          errors++;
          continue;
        }

        const demand = demandDoc.data();
        const clientId = demand.clientId;

        if (!clientId) {
          console.log(`⚠️  Proposta ${proposalId}: demanda não tem clientId!`);
          errors++;
          continue;
        }

        // 4. Atualizar proposta com clientId
        await db.collection('proposals').doc(proposalId).update({
          clientId: clientId,
        });

        console.log(`✅ Proposta ${proposalId}: clientId adicionado (${clientId})`);
        updated++;
      } catch (error) {
        console.error(`❌ Erro ao processar proposta ${proposalId}:`, error.message);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`📈 Resultados da migração:`);
    console.log(`   ✅ Atualizadas: ${updated}`);
    console.log(`   ⏭️  Puladas: ${skipped}`);
    console.log(`   ❌ Erros: ${errors}`);
    console.log('='.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('🔥 Erro fatal:', error);
    process.exit(1);
  }
}

migrateProposals();
