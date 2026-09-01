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

## Segurança em Firestore
### `usuarios`
- autenticado lê apenas o próprio documento;
- cliente não altera `nivel_acesso`, `ids_setor` e `ativo`.

### `arquivos`
- Usuário lê apenas arquivos públicos do próprio setor;
- Admin lê arquivos públicos e restritos dos próprios setores;
- somente Admin cria, atualiza e remove arquivos do próprio contexto.

### `solicitacoes`
- Usuário lê apenas as próprias solicitações;
- Usuário cria solicitação apenas no próprio setor e com estado inicial correto;
- Usuário edita ou cancela apenas em `em_aberto`;
- Admin lê e atualiza solicitações dos próprios setores;
- Admin respeita transições válidas de status.

---

## Segurança em Storage
### Biblioteca
- Usuário comum lê apenas `nivel_1` do próprio setor;
- Admin lê `nivel_1` e `nivel_2` dos próprios setores;
- apenas Admin envia, substitui ou remove arquivos da biblioteca.

### Solicitações
- Usuário comum lê apenas o anexo final das próprias solicitações concluídas;
- Admin lê anexos de solicitações dos setores em que atua;
- apenas Admin envia o anexo final.

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