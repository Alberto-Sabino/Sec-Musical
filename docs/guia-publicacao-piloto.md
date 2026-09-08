# Guia de publicação e piloto — execução manual (Lote 9)

Passo a passo para você publicar o MVP e preparar o piloto controlado.
Requer Billing/Blaze ativo e login no Firebase. Comandos rodam a partir da raiz do projeto.

> O que já está pronto no repositório: build gerando `dist/`, `firebase.json` (hosting + rewrites SPA),
> `firestore.rules`, `storage.rules` (rascunho), `firestore.indexes.json`, seed de emulador e docs de piloto.

---

## 0. Pré-requisitos
- Node 20+ e npm instalados.
- Conta Firebase com o projeto `sec-musical-mvp`.
- Cloud Billing (plano Blaze) ativo — necessário para Cloud Storage real.
- Firebase CLI:
  ```bash
  npm install -g firebase-tools
  firebase login
  ```

---

## 1. Confirmar o projeto
```bash
firebase use sec-musical-mvp
```
Se não aparecer, adicionar:
```bash
firebase use --add
```

---

## 2. Preencher variáveis de ambiente
```bash
cp .env.example .env.local
```
Preencher em `.env.local` as chaves reais do Firebase (Console > Configurações do projeto).
Para produção com Storage real, ajustar:
```
VITE_APP_MODE=producao
```
> Enquanto o Storage de produção não estiver validado (Billing), desenvolver com `VITE_APP_MODE=emulador` (arquivos reais via Storage emulator, sem Billing).

---

## 3. Validar localmente antes de publicar
```bash
npm install
npm run build          # deve terminar sem erro; gera dist/
```
Opcional — testes de regras (via Docker, isolado):
```bash
docker build -f Dockerfile.rules-test -t portal-musical-rules-test .
docker run --rm portal-musical-rules-test   # esperado: 42/42 pass
```

---

## 4. Publicar regras e índices
```bash
firebase deploy --only firestore:rules,firestore:indexes
```
> As regras de Storage ainda são rascunho não validado. Só publicar Storage quando
> for validar o Storage real:
> ```bash
> firebase deploy --only storage
> ```

---

## 5. Publicar o frontend (Hosting)
```bash
npm run build
firebase deploy --only hosting
```
Ao final, o CLI mostra a URL pública (Hosting URL). Guardar para o piloto.

---

## 6. Preparar dados iniciais do piloto
Seguir `docs/piloto-seed-dados.md` (estrutura exata dos documentos).

1. **Setores**: criar o(s) setor(es) do piloto na coleção `setores`.
2. **Usuários**:
   - criar cada pessoa em Authentication (e-mail/senha);
   - criar o documento em `usuarios` com doc id = UID do Auth, definindo
     `nivel_acesso` (1 usuário / 2 admin), `ativo: true` e `ids_setor`.
3. **Biblioteca**: cadastrar os primeiros arquivos.
   - Com Storage de produção: usar a própria tela de admin (upload real).
   - Sem Billing: os uploads/downloads funcionam contra o Storage emulator local (modo `emulador`), seguindo o `id_nuvem` oficial.

> Ensaio local opcional (emulador): `npm run emulators` e, em outro terminal,
> `npm run seed:emulador` para popular dados de teste.

---

## 7. Definir setor piloto e responsáveis
- Escolher 1 setor para começar.
- Definir ao menos 1 admin (Secretário) e os usuários (Encarregados) do setor.
- Comunicar a URL e as credenciais aos participantes.

---

## 8. Acompanhar indicadores
Seguir `docs/piloto-indicadores.md`:
- logins, consultas à Biblioteca, solicitações abertas/concluídas, erros críticos.

---

## 9. Checklist de saída do piloto
- [ ] Hosting publicado e acessível na URL.
- [ ] Regras e índices do Firestore publicados.
- [ ] Setor piloto criado.
- [ ] Admin e usuários criados e ativos.
- [ ] Primeiros arquivos na Biblioteca.
- [ ] Responsáveis definidos e avisados.
- [ ] Indicadores sendo coletados.

---

## Pendência conhecida (aceita)
Cloud Storage real, regras de Storage e upload/download reais permanecem pendentes
de validação enquanto não operados contra o Storage de produção. Em
desenvolvimento, upload/download/remoção funcionam via Storage emulator.
Ao ativar o Storage real:
1. `VITE_APP_MODE=producao` no ambiente;
2. revisar e validar `storage.rules`;
3. `firebase deploy --only storage`;
4. validar upload/download reais na Biblioteca e no anexo final de Solicitações.
