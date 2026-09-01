# Spec 01 — Fundação técnica, ambiente e estrutura inicial

## Objetivo
Preparar a base técnica do projeto para que o desenvolvimento do MVP aconteça de forma organizada, reproduzível e compatível com trabalho assistido por IA.

## Resultado esperado
Ao final desta spec, deve existir uma aplicação Vue inicializada, conectada ao Firebase, com estrutura mínima de pastas, ambientes, regras e pontos de extensão bem definidos.

---

## Escopo desta spec
Inclui:
- criação do repositório;
- setup inicial do projeto Vue;
- configuração do Firebase;
- configuração de emuladores;
- arquivos de ambiente;
- estrutura inicial de pastas;
- versionamento de regras e índices;
- base operacional para uso do Kiro.

Não inclui:
- implementação completa das telas;
- lógica de negócio final dos módulos;
- design system completo;
- publicação do MVP em produção.

---

## Stack prevista
- Vue
- Firebase Authentication
- Cloud Firestore
- Cloud Storage
- Firebase Hosting
- Firebase Security Rules
- Firebase Emulator Suite
- Git
- Firebase CLI
- Kiro como agente de IA assistente

---

## Estrutura mínima esperada do projeto
### Diretórios sugeridos
- `src/app`
- `src/modulos`
- `src/modulos/autenticacao`
- `src/modulos/biblioteca`
- `src/modulos/solicitacoes`
- `src/modulos/admin`
- `src/componentes`
- `src/composables`
- `src/servicos/firebase`
- `src/servicos/repositorios`
- `src/servicos/casos_de_uso`
- `src/router`
- `src/tests`

### Arquivos e bases técnicas esperadas
- inicialização do app
- configuração do router
- arquivo de configuração do Firebase
- regras do Firestore
- regras do Storage
- arquivo de índices do Firestore
- configuração de emuladores
- arquivo com convenções de ambiente local

---

## Comportamentos e decisões obrigatórias
- o projeto deve nascer **mobile-first**;
- a arquitetura deve evitar backend tradicional no fluxo principal;
- Firestore e Storage fazem parte central da solução;
- regras e índices devem ser versionados junto do projeto;
- a organização deve privilegiar clareza sobre abstração precoce;
- o Kiro deve operar com base nas specs e no steering, não por inferência livre.

---

## Fluxo técnico esperado
1. Criar o repositório.
2. Inicializar o projeto Vue.
3. Conectar o projeto ao Firebase.
4. Configurar Firestore, Storage, Authentication e Hosting.
5. Configurar emuladores locais.
6. Criar a estrutura inicial de pastas.
7. Adicionar arquivos de regras e índices ao versionamento.
8. Validar que a aplicação sobe localmente e consegue conversar com o ambiente configurado.

---

## Critérios de aceite
- o projeto inicia localmente sem configuração manual obscura;
- existe estrutura de pastas aderente ao steering técnico;
- o Firebase está configurado para autenticação, dados, arquivos e hosting;
- regras e índices existem como arquivos versionados;
- emuladores podem ser usados no desenvolvimento local;
- a base do projeto está pronta para receber módulos e componentes.

---

## Dependências
Depende conceitualmente de:
- documento técnico mestre
- backlog do MVP
- convenções e steering técnico

---

## Riscos que esta spec reduz
- setup inconsistente entre ambientes;
- crescimento desorganizado da base de código;
- dependência excessiva de decisões improvisadas;
- uso da IA sem base clara de contexto.

---

## Diretriz final
Esta spec não busca “construir o produto”, e sim **preparar um terreno limpo, previsível e escalável para construir o MVP com segurança e velocidade**.