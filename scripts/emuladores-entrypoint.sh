#!/bin/sh
# Entrypoint dos emuladores com persistência confiável via volume em /data.
#
# Por que não usar apenas --export-on-exit: ele reage a saída interativa (SIGINT)
# e não é confiável com o SIGTERM enviado por `docker compose down/stop`.
# Aqui rodamos o emulador em segundo plano e, ao receber TERM/INT, fazemos um
# export explícito (`firebase emulators:export`) antes de encerrar.
set -e

DATA_DIR=/data/export
PROJETO=sec-musical-mvp
mkdir -p "$DATA_DIR"

encerrar() {
  echo "[emuladores] Sinal recebido; exportando estado para $DATA_DIR ..."
  # Export explícito enquanto o hub ainda está vivo.
  firebase emulators:export "$DATA_DIR" --force --project "$PROJETO" || \
    echo "[emuladores] AVISO: export falhou"
  # Encerra o processo dos emuladores.
  if [ -n "$EMU_PID" ]; then
    kill -TERM "$EMU_PID" 2>/dev/null || true
    wait "$EMU_PID" 2>/dev/null || true
  fi
  exit 0
}
trap encerrar TERM INT

# Importa o estado anterior apenas se houver um export válido (evita erro no 1º boot).
if [ -f "$DATA_DIR/firebase-export-metadata.json" ]; then
  echo "[emuladores] Importando estado persistido de $DATA_DIR"
  firebase emulators:start \
    --only auth,firestore,storage \
    --project "$PROJETO" \
    --import="$DATA_DIR" &
else
  echo "[emuladores] Sem estado prévio; iniciando limpo"
  firebase emulators:start \
    --only auth,firestore,storage \
    --project "$PROJETO" &
fi

EMU_PID=$!
# Mantém o container vivo aguardando o processo; o trap cuida do encerramento.
wait "$EMU_PID"
