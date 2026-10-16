# Spec 08 — Segurança, auditoria e testes críticos

## Objetivo
Garantir que o MVP seja seguro para uso real, com proteção de dados e arquivos diretamente na infraestrutura, além de validação dos fluxos mais sensíveis.

## Escopo desta spec
Inclui:
- regras de acesso do Firestore;
- regras de acesso do Storage;
- proteção das transições válidas de status;
- auditoria básica de arquivos e solicitações;
- testes críticos em ambiente local com emuladores.

Não inclui:
- SOC, compliance formal ou trilhas corporativas avançadas;
- sistema completo de observabilidade;
- automações sofisticadas de saneamento de dados órfãos.

---

## Princípios obrigatórios
- negar tudo por padrão;
- liberar apenas o necessário;
- não confiar na interface para segurança;
- usar o documento do usuário como fonte de verdade de acesso;
- impedir elevação indevida de privilégio;
- proteger arquivos e dados por perfil e setor.

---

## Fontes de autorização
- o Firestore autoriza pelo documento `usuarios/{uid}`, lido pelas próprias regras;
- o Storage autoriza por Custom Claims no token (`ativo`, `nivel_acesso`, `ids_setor`, `admin_global`), porque as regras de Storage não leem o Firestore;
- os claims espelham `usuarios/{uid}`: sincronizados em produção e injetados pelo seeder no ambiente local.

---

## Segurança em Firestore
### `usuarios`
- autenticado lê apenas o próprio documento;
- cliente não cria nem altera (sem escrita), impedindo mudar `nivel_acesso`, `ids_setor`, `ativo` e `admin_global`.

### `setores`
- leitura apenas por usuário ativo que pertence ao setor (para exibir o nome);
- sem escrita pelo cliente.

### `arquivos`
- escopo `setor`: usuário ativo do setor lê `nivel_1`; `nivel_2` só admin;
- escopo `global`: qualquer usuário ativo lê `nivel_1`; `nivel_2` só admin;
- arquivos de setor: criados, atualizados e removidos só por admin do setor;
- arquivos globais: criados, atualizados e removidos só por admin com `admin_global`, sem `id_setor`.

### `solicitacoes`
- Usuário lê apenas as próprias solicitações;
- Usuário cria solicitação apenas no próprio setor, com estado inicial correto e `comum_congregacao`/`nome_beneficiario`/`descricao` válidos;
- Usuário edita ou cancela apenas em `em_aberto`;
- Admin lê e trata solicitações dos próprios setores, respeitando as transições válidas;
- uma vez assumida (`em_andamento`), só o responsável que assumiu pode alterá-la.

---

## Segurança em Storage
### Biblioteca
- escopo setor: usuário ativo do setor lê `nivel_1`; `nivel_2` só admin; escrita/remoção só por admin do setor;
- escopo global: usuário ativo lê `nivel_1`; `nivel_2` só admin; escrita/remoção só por `admin_global`;
- validação de MIME (PDF/XLSX) e teto de tamanho.

### Solicitações
- o anexo final (`resposta.pdf`) é legível **somente pelo solicitante** — nem o admin lê;
- apenas o admin do setor envia o anexo final (PDF até 2 MB).

---

## Auditoria mínima esperada
### Em `arquivos`
Registrar:
- ação
- `id_usuario`
- data da ação

### Em `solicitacoes`
Registrar:
- ação
- `id_usuario`
- status anterior, quando aplicável
- status novo, quando aplicável
- data da ação

---

## Fluxos críticos que exigem validação
- login e carregamento do contexto;
- leitura da biblioteca por perfil e setor;
- criação de solicitação com valores iniciais corretos;
- edição e cancelamento em `em_aberto`;
- transação para assumir solicitação;
- upload de arquivo da biblioteca;
- upload do anexo final da solicitação;
- download autenticado;
- bloqueio de acesso indevido.

---

## Estratégia de testes
- usar Firebase Emulator Suite sempre que possível;
- validar regras do Firestore com cenários permitidos e bloqueados;
- validar regras do Storage com cenários permitidos e bloqueados;
- testar concorrência ao assumir solicitação;
- testar integração completa dos fluxos críticos.

---

## Critérios de aceite
- usuário comum não acessa dados nem arquivos fora do próprio contexto;
- admin não acessa dados nem arquivos fora de seus setores;
- transições inválidas de status são bloqueadas;
- upload e download obedecem às regras publicadas;
- auditoria mínima é registrada nas ações essenciais;
- os fluxos críticos passam em validação local antes da publicação.

---

## Dependências
- Spec 01 — Fundação técnica, ambiente e estrutura inicial
- Spec 02 — Autenticação, sessão e contexto do usuário
- Spec 04 — Biblioteca: consulta, listagem, filtro e download
- Spec 05 — Biblioteca admin: cadastro, edição, remoção e auditoria
- Spec 06 — Solicitações do usuário: criação, acompanhamento, edição, cancelamento e download
- Spec 07 — Solicitações admin: fila, tratamento, comentário, anexo final e conclusão

---

## Diretriz final
No MVP, segurança não é camada complementar. Ela é **parte estrutural do produto** e deve ser tratada como requisito central desde o primeiro dia de implementação.