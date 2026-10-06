# Spec 19 — UI Motion: animações leves e padronizadas (smooth, sem perder métricas)

**Projeto:** Portal Musical MVP (Vue/Vite + Firebase)  
**Baseline:** 2026-10-06  
**Objetivo:** adicionar e padronizar animações **leves, consistentes e previsíveis** para melhorar a sensação de fluidez (“smooth”) **sem degradar performance** (Lighthouse/WebPageTest) e **sem instabilidade visual** (layout shift).

> Esta spec é curta e focada: **somente motion/animações**. Não muda contrato de dados, regras, rotas, nem adiciona dependências.

---

## 0) Princípios obrigatórios

1) **Performance primeiro**
- Animar **apenas** propriedades baratas: `opacity` e `transform`.
- Evitar animar `height`, `width`, `top/left`, `box-shadow` pesado, `filter`, `backdrop-filter`.
- Evitar animações contínuas (loop) e evitar “parallax”.

2) **Sem CLS (layout shift)**
- Não introduzir mudanças de layout durante animação.
- Preferir transições de entrada/saída por `opacity/transform`.
- Loading deve reservar espaço (skeleton/placeholder) quando aplicável.

3) **Consistência visual**
- Um conjunto pequeno de durações/easings.
- Mesma sensação em todo o app: modais, feedback, loadings, transições de tela.

4) **Acessibilidade**
- Respeitar `prefers-reduced-motion: reduce`.
- Motion deve ser “decorativo/auxiliar”, nunca requisito para entender estado.

5) **Sem dependências novas**
- Implementar com CSS + `<Transition>`/`<TransitionGroup>` do Vue.

---

## 1) Escopo desta spec (o que entra)

### 1.1 Componentes/fluxos que devem ganhar motion padronizado

A) **Modais**
- Abertura/fechamento com fade + leve slide/scale.
- Backdrop com fade.

B) **Transições de tela (route transitions)**
- Transição sutil entre páginas autenticadas.
- Não aplicar em telas onde possa causar sensação de atraso (ex.: login pode ficar sem transição).

C) **Loadings**
- Loading state com fade-in rápido.
- Evitar “piscar”: aplicar **delay mínimo** (ex.: só mostrar loading se durar > 120ms) quando fizer sentido.

D) **Mensagens de feedback (erro/sucesso/aviso/info)**
- Entrada/saída suave (fade + slide pequeno).
- Sem empurrar layout de forma brusca (preferir reservar área ou animar apenas opacidade/transform).

E) **Recarregamento soft (refresh visual)**
- Quando uma lista recarrega (ex.: Biblioteca/Solicitações), aplicar:
  - manter layout estável;
  - usar “estado carregando” com transição suave;
  - opcional: `TransitionGroup` para itens (apenas se não degradar performance em listas grandes).

---

## 2) Fora de escopo (proibições)

- Não criar biblioteca de animação.
- Não criar microinterações complexas.
- Não animar tudo: **motion seletivo**.
- Não alterar design system além do necessário para tokens de motion.
- Não mudar HTML estrutural de telas de forma ampla.

---

## 3) Padrão de motion (tokens)

Criar tokens globais em `src/componentes/tokens.css` (ou arquivo já existente de tokens) para centralizar:

### 3.1 Durações
- `--dur-1: 120ms;` (micro)
- `--dur-2: 180ms;` (padrão)
- `--dur-3: 240ms;` (ênfase leve)

### 3.2 Easing
- `--ease-standard: cubic-bezier(0.2, 0, 0, 1);` (suave, sem overshoot)
- `--ease-emphasized: cubic-bezier(0.2, 0, 0, 1);` (mesmo easing; variar duração, não curva)

### 3.3 Distâncias
- `--motion-y: 6px;` (slide vertical sutil)
- `--motion-scale: 0.98;` (scale sutil)

### 3.4 Reduced motion
Adicionar regra global:
- quando `prefers-reduced-motion: reduce`, reduzir durações para ~1ms e remover transform.

---

## 4) Implementação (padrões técnicos)

### 4.1 Classes de transição (CSS)
Criar um conjunto pequeno de transições reutilizáveis (nomes estáveis):

- `fade`
- `fade-slide-up`
- `modal-pop`

Cada uma deve ter `*-enter-active`, `*-leave-active`, `*-enter-from`, `*-leave-to` usando apenas `opacity` e `transform`.

### 4.2 Vue `<Transition>`
- Modais e feedback devem usar `<Transition name="..." appear>` quando fizer sentido.
- Evitar transição em elementos que re-renderizam com alta frequência.

### 4.3 Route transitions
- Implementar transição no shell (provavelmente `src/app/App.vue`) envolvendo `<RouterView>`.
- Usar `mode="out-in"` apenas se não causar sensação de lentidão; caso cause, usar transição simples sem bloquear.

### 4.4 Listas
- `TransitionGroup` só em listas pequenas/médias.
- Para listas potencialmente grandes, preferir fade do container (não item a item).

---

## 5) Arquivos prováveis a alterar

- `src/componentes/tokens.css` (tokens de motion + reduced motion)
- `src/app/App.vue` (route transition)
- `src/componentes/ModalConfirmacao.vue` (ou componente equivalente de modal)
- `src/componentes/MensagemFeedback.vue`
- `src/componentes/EstadoCarregando.vue` / `LoadingState.vue` (ou equivalente)
- Páginas com recarregamento de lista:
  - `src/modulos/biblioteca/*`
  - `src/modulos/solicitacoes/*`

> Observação: nomes exatos devem respeitar o que já existe no repositório; não criar duplicatas.

---

## 6) Critérios de aceite

### 6.1 Qualidade visual
- Modais abrem/fecham com animação suave e consistente.
- Mensagens de erro/sucesso entram/saem suavemente.
- Troca de telas tem transição sutil (sem “efeito apresentação”).
- Loadings não “piscam” e não empurram layout.

### 6.2 Performance e estabilidade
- Não introduzir CLS perceptível.
- Não introduzir jank em scroll.
- Não aumentar significativamente o tempo de interação (INP) por causa de animação.
- Lighthouse/WebPageTest: **não regredir métricas** (comparar antes/depois).

### 6.3 Acessibilidade
- Com `prefers-reduced-motion`, animações ficam praticamente desativadas.

---

## 7) Validação obrigatória

- Validar manualmente em mobile (viewport pequeno) e desktop.
- Validar:
  - abrir/fechar modal de confirmação;
  - navegar entre Home ↔ Biblioteca ↔ Solicitações;
  - disparar erro de formulário (ex.: login inválido / validação);
  - carregar lista vazia e lista com itens.
- Rodar Lighthouse (local) e comparar com baseline.

---

## 8) Diretrizes finais (anti-overengineering)

- Se houver dúvida entre “animar mais” e “manter simples”, manter simples.
- Se houver dúvida entre “efeito bonito” e “métrica/performance”, preservar métrica.
- Motion deve reforçar previsibilidade e acolhimento, não chamar atenção.

---

## 9) Ajustes pós-implementação (correções de regressão)

Registro dos ajustes feitos após a validação navegando pelo sistema. Mantêm o
escopo da spec (motion seletivo, só `opacity/transform`, sem novas deps).

### 9.1 Transição de rota apenas na entrada (sem animar a saída)
- **Sintoma:** ao trocar de tela, durante o fade-out da `route-fade` dava para
  ver a tela anterior sendo desmontada (campos limpando / layout quebrando)
  antes de sumir. Sensação de fragilidade.
- **Causa:** a `route-fade` tinha animação de saída (`leave-active`). Com
  `mode="out-in"`, a tela antiga ficava visível (~180ms) enquanto o teardown
  reativo da navegação já ocorria.
- **Correção:** `route-fade` passou a ser **enter-only** (removidos
  `.route-fade-leave-active` e `.route-fade-leave-to` em
  `src/componentes/tokens.css`). A saída é instantânea; só a tela que chega faz
  fade-in. Elimina o desmonte visível e mantém a transição sutil.

### 9.2 Formulários de edição: eliminar flash “vazio → carrega → preenchido”
- **Sintoma:** ao abrir edição (ex.: arquivo da biblioteca), o formulário
  aparecia **vazio** por um instante, depois trocava para o loading e só então
  reabria preenchido.
- **Causa:** bug de estado pré-existente (exposto pela transição de estados do
  form): `carregandoInicial` iniciava `false`, então o primeiro frame
  renderizava o formulário vazio antes do `onMounted` disparar o fetch.
- **Correção:** `carregandoInicial` passa a **nascer `true` em modo edição**
  (`ref(!!route.params.id)`) em:
  - `src/modulos/admin/PaginaArquivoForm.vue`
  - `src/modulos/solicitacoes/PaginaSolicitacaoForm.vue`

  A sequência vira **loading → formulário preenchido** (swap único e suave), sem
  nunca exibir o formulário vazio. Páginas de detalhe/lista já usavam
  `ref(true)` e não tinham o problema.

### 9.3 Observações
- Nenhuma mudança de contrato de dados, rotas ou regras.
- Modais reais (`ModalConfirmacao`, modal de saída em `App.vue`) seguem com
  `fade` + `modal-pop`; seu conteúdo é síncrono (props), então abrem já
  preenchidos.
