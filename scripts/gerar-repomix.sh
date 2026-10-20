#!/usr/bin/env bash
#
# gerar-repomix.sh
# Gera a base técnica do Portal Musical empacotada em blocos Repomix separados por
# contexto, prontos para serem enviados a uma IA externa. Cada bloco é uma unidade
# coerente que pode ser carregada isoladamente, economizando janela de contexto.
#
# Uso:
#   bash scripts/gerar-repomix.sh
#
# Requisitos: Node + npx (usa `npx repomix`, sem instalação global).
# NUNCA inclui .env.local / .env.prod — apenas .env.example. O scan de segurança
# do repomix permanece LIGADO (não use --no-security-check).

set -euo pipefail

OUT="repomix-out"
STYLE="markdown"

mkdir -p "$OUT"
# recria a pasta do zero (idempotente), preservando nada do estado anterior
rm -f "$OUT"/*.md "$OUT"/*.txt 2>/dev/null || true

gerar() {
  local arquivo="$1"; shift
  local includes="$1"; shift
  echo ">> gerando $arquivo"
  npx --yes repomix \
    --include "$includes" \
    --style "$STYLE" \
    --output "$OUT/$arquivo" \
    --remove-empty-lines \
    --quiet
}

# 00 — Mapa do projeto (apenas a árvore, sem conteúdo de arquivos).
echo ">> gerando 00-estrutura.md (somente árvore)"
npx --yes repomix \
  --style "$STYLE" \
  --output "$OUT/00-estrutura.md" \
  --no-files \
  --include-full-directory-structure \
  --quiet

# 01 — Documentação narrativa: visão geral, guias, decisões, steering, documento mestre.
gerar "01-docs-visao-geral.md" \
  "README.md,CONTRIBUTING.md,docs/README-docs.md,docs/guias/**,docs/decisoes/**,docs/steering/**,docs/master/**"

# 02 — Especificações (specs densas, carregadas sob demanda).
gerar "02-docs-specs.md" \
  "docs/specs/**"

# 03 — Stack, build e ferramentas.
gerar "03-stack-configs.md" \
  "package.json,functions/package.json,vite.config.js,eslint.config.js,.prettierrc.json,.prettierignore,.dockerignore,docker-compose.yml,Dockerfile.emuladores,index.html,.env.example,.gitignore"

# 04 — Backend & segurança: Cloud Functions + configuração Firebase + regras.
gerar "04-backend-seguranca.md" \
  "functions/**,firebase.json,.firebaserc,firestore.rules,firestore.indexes.json,storage.rules"

# 05 — Frontend núcleo & UI: entrada do app, componentes, enums.
gerar "05-frontend-ui.md" \
  "src/app/**,src/componentes/**,src/enums/**"

# 06 — Frontend domínio: serviços e composables (regras de negócio / estado).
gerar "06-frontend-dominio.md" \
  "src/servicos/**,src/composables/**"

# 07 — Frontend navegação: router e módulos/telas.
gerar "07-frontend-navegacao.md" \
  "src/router/**,src/modulos/**"

# 08 — Testes & scripts.
gerar "08-testes-scripts.md" \
  "tests/**,src/tests/**,scripts/**,Dockerfile.rules-test"

echo ""
echo "=================================================="
echo "Blocos gerados em $OUT/ :"
echo "=================================================="
for f in "$OUT"/*.md; do
  chars=$(wc -c < "$f")
  printf "  %-34s %8d bytes  (~%d tokens)\n" "$(basename "$f")" "$chars" "$((chars/4))"
done
total=$(cat "$OUT"/*.md | wc -c)
echo "--------------------------------------------------"
printf "  %-34s %8d bytes  (~%d tokens)\n" "TOTAL" "$total" "$((total/4))"
echo ""
echo "Dica de carregamento por tarefa:"
echo "  - Onboarding da IA .......: 00 primeiro, depois os demais em ordem"
echo "  - Segurança/backend ......: 00 + 04"
echo "  - Feature de UI ..........: 00 + 05 + 07"
echo "  - Regra de negocio .......: 00 + 06"
echo "  - Produto/decisoes .......: 00 + 01 + 02"
