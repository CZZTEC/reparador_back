# 🚀 Deployment das Regras do Firestore

## Arquivos Modificados

- `firestore.rules` - Regras de segurança atualizadas

## Mudanças Realizadas

### ✅ Demands (Demandas)
**Antes:**
```
allow update: if isLoggedIn() && 
  resource.data.clientId == request.auth.uid;
```

**Depois:**
```
allow update: if isLoggedIn() && (
  resource.data.clientId == request.auth.uid ||
  (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['proposalCount', 'isClosed', 'updatedAt']))
);
```

**Por quê?**
- Cliente continua podendo atualizar todos os campos da sua demanda
- Profissionais agora podem atualizar APENAS: `proposalCount`, `isClosed`, `updatedAt`
- Isso permite que o incrementador de propostas funcione sem expor segurança

## Como Fazer Deploy

### Opção 1: Firebase CLI (Recomendado)
```bash
firebase deploy --only firestore:rules
```

### Opção 2: Firebase Console
1. Ir em: https://console.firebase.google.com/
2. Selecionar projeto: `reparador-de7b5`
3. Firestore Database → Aba "Rules"
4. Copiar o conteúdo de `firestore.rules` e colar
5. Publicar

### Opção 3: Emulador Local (Desenvolvimento)
```bash
firebase emulators:start --only firestore
```

## Verificação

Após fazer deploy, execute um teste:
1. Abra profissional e tente enviar proposta
2. Deve exibir:
   - ✅ Proposta criada com sucesso
   - ✅ Contador incrementado
   - ✅ Demanda fechada no 5º envio

## Erros Esperados Agora Resolvidos

❌ Antes:
```
W/Firestore: Write failed at demands: Status{code=PERMISSION_DENIED...}
```

✅ Depois:
```
I/flutter: ✅ [PROPOSAL] Proposal created: <proposalId>
```

---

**Data de Atualização:** 01/03/2026  
**Versão:** 1.0
