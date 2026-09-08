# Índice de specs operacionais — MVP

## Objetivo
Mapear as specs operacionais criadas para transformar o Portal Musical MVP em trabalho executável por time técnico e por agente de IA.

## Como usar estas specs
1. Ler primeiro o **Documento técnico mestre**.
2. Ler os **Steering files**.
3. Ler a **spec operacional de execução da sprint ativa**.
4. Usar as **specs base de domínio** citadas por essa spec operacional.
5. Em caso de conflito, o escopo do MVP e as regras de segurança prevalecem.

---

## Leitura mínima para execução 100% pelo Kiro
### Base permanente
- Documento técnico mestre — Portal Musical MVP
- Steering 01 — Produto e limites do MVP
- Steering 02 — Arquitetura Vue + Firebase
- Steering 03 — Dados, autorização e segurança
- Steering 04 — Design system base e UX mobile-first
- Steering 05 — Protocolo de uso do Kiro

### Execução prática
- Spec 09 — Execução operacional da Sprint 1
- Spec 10 — Execução operacional da Sprint 2
- Spec 11 — Melhoria de infraestrutura local

### Specs base de apoio
As specs 01 a 08 continuam válidas como contrato funcional e técnico do domínio.

---

## Ordem recomendada das specs
### Spec 01
**Fundação técnica, ambiente e estrutura inicial**

Cobrirá:
- setup do projeto Vue;
- configuração de Firebase;
- emuladores;
- organização de pastas;
- versionamento de regras e índices;
- base para uso do Kiro.

### Spec 02
**Autenticação, sessão e contexto do usuário**

Cobrirá:
- login e logout;
- carregamento do documento do usuário;
- papel, status ativo e setores;
- guards de rota;
- setor ativo do admin.

### Spec 03
**Design system base e layout mobile-first**

Cobrirá:
- tokens visuais;
- componentes base;
- padrões de layout;
- estados visuais comuns;
- consistência da experiência.

### Spec 04
**Biblioteca — consulta, listagem, filtro e download**

Cobrirá:
- listagem por perfil;
- filtros;
- detalhe do arquivo;
- download autenticado;
- estados de carregamento, vazio e erro.

### Spec 05
**Biblioteca admin — cadastro, edição, remoção e auditoria**

Cobrirá:
- formulário de arquivo;
- upload para Storage;
- persistência em Firestore;
- substituição de arquivo;
- remoção;
- auditoria básica.

### Spec 06
**Solicitações do usuário — criação, acompanhamento, edição, cancelamento e download**

Cobrirá:
- nova solicitação;
- listagem das próprias solicitações;
- detalhe;
- edição e cancelamento em aberto;
- download do anexo final.

### Spec 07
**Solicitações admin — fila, tratamento, comentário, anexo final e conclusão**

Cobrirá:
- fila por setor ativo;
- filtro por status;
- transação de assumir;
- comentário público;
- upload do anexo final;
- conclusão e cancelamento.

### Spec 08
**Segurança, auditoria e testes críticos**

Cobrirá:
- regras de Firestore;
- regras de Storage;
- transições válidas;
- auditoria mínima;
- testes prioritários em emuladores.

### Spec 09
**Execução operacional da Sprint 1**

Cobrirá:
- transformação da Sprint 1 em lotes executáveis pelo Kiro;
- ordem real de implementação;
- critérios de saída por lote;
- gate de fechamento da Biblioteca ponta a ponta.

### Spec 10
**Execução operacional da Sprint 2**

Cobrirá:
- transformação da Sprint 2 em lotes executáveis pelo Kiro;
- fechamento do módulo de Solicitações;
- segurança final, validação crítica e piloto;
- gate final de MVP pronto para operação controlada.

---

## Regra de manutenção
Se uma decisão funcional ou técnica mudar, atualizar primeiro a spec mais específica afetada e depois refletir a mudança no documento mestre, no steering e no backlog, se necessário.

---

## Resultado esperado
Ao final deste pacote de specs, o projeto terá:
- clareza de execução;
- melhor uso do Kiro;
- menos interpretação implícita;
- menor risco de retrabalho;
- ponte direta entre documentação e código.