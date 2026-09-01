# Steering 02 — Arquitetura Vue + Firebase

## Objetivo
Definir a arquitetura prática do projeto para que Vue e Firebase sejam usados com simplicidade, clareza e boa separação de responsabilidades.

## Stack oficial
- Vue
- Vue Router
- Firebase Authentication
- Cloud Firestore
- Cloud Storage
- Firebase Hosting
- Firebase Security Rules
- Firebase Emulator Suite

## Decisão arquitetural central
O MVP não depende de backend tradicional no fluxo principal.

Isso significa:
- upload e download acontecem pela aplicação;
- regras do Firebase fazem parte da proteção real do sistema;
- Firestore e Storage não são detalhes de infraestrutura, mas parte central da arquitetura;
- Cloud Functions só entram se houver necessidade real posterior.

## Organização sugerida do projeto
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

## Separação de responsabilidades
### Interface
Responsável por:
- páginas;
- componentes;
- formulários;
- estado visual;
- navegação;
- feedback ao usuário.

### Casos de uso
Responsável por:
- orquestrar fluxos de negócio;
- chamar repositórios;
- validar regras de experiência;
- manter legibilidade das ações principais.

Exemplos:
- criarSolicitacao
- editarSolicitacao
- cancelarSolicitacao
- assumirSolicitacao
- concluirSolicitacao
- cadastrarArquivo
- atualizarArquivo
- removerArquivo

### Repositórios
Responsável por:
- encapsular acesso a Firestore e Storage;
- centralizar consultas;
- esconder detalhes do SDK do restante da aplicação.

### Serviços Firebase
Responsável por:
- inicialização do app Firebase;
- configuração de Auth, Firestore e Storage;
- integração com emuladores, quando aplicável.

## Diretrizes de implementação
- preferir funções pequenas e específicas;
- centralizar consultas por entidade em repositórios;
- evitar abstrações genéricas cedo demais;
- evitar “framework interno” dentro do projeto;
- estruturar por domínio real, não por categorias excessivamente abstratas.

## Decisões contra overengineering
Não criar no início:
- camada de domínio formalista desnecessária;
- sistema de eventos interno complexo;
- serviço universal de arquivos multiuso super abstrato;
- máquina de estados completa se transições simples resolverem;
- backend espelho do que já está protegido por regras.

## Quando Cloud Functions podem entrar
Somente se surgir necessidade real de:
- notificações automáticas;
- rotinas agendadas;
- integrações externas;
- operações privilegiadas fora do alcance confortável das regras;
- saneamento automatizado recorrente.

## Regra de infraestrutura trocável
Integrações externas e recursos de plataforma devem ser acessados por camada de infraestrutura trocável.

### Diretriz
A UI não fala diretamente com implementações concretas de arquivo.
Os casos de uso consomem interfaces estáveis.
A infraestrutura pode ter mais de uma implementação, desde que preserve assinatura, contrato e comportamento esperado.

### Aplicação obrigatória neste MVP
Para operações de arquivo, prever:
- implementação `mock`
- implementação `firebase`

### Regra de troca
A seleção da implementação deve ocorrer por configuração do projeto, sem bifurcação espalhada na UI.

## Seleção de infraestrutura
Operações de arquivo devem ser resolvidas por configuração central do projeto.

Exemplo esperado:
- `mock`
- `firebase`

A troca de implementação não deve exigir alteração em componentes visuais nem em casos de uso.

### Proibição
- não espalhar `if mock` dentro de componentes visuais;
- não duplicar regra de negócio por causa da infraestrutura;
- não criar contrato diferente entre mock e firebase.

## Diretrizes para o Kiro
Ao gerar arquitetura ou código:
- respeitar a estrutura de pastas sugerida;
- manter separação entre interface, caso de uso e repositório;
- não pular direto para solução complexa;
- não introduzir dependências que compliquem o MVP sem retorno claro;
- sempre justificar nova camada pela dor que ela resolve.

## Resultado esperado
A base do projeto deve nascer pequena, legível, reproduzível e preparada para crescimento controlado.