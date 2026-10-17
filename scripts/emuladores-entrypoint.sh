#!/bin/sh
# Entrypoint dos emuladores com persistência resiliente via volume em /data.
#
# Estratégia de persistência em três camadas (defesa em profundidade):
#   1. --export-on-exit: o próprio emulador tenta exportar ao sair de forma limpa.
#   2. trap TERM/INT + export explícito: cobre `docker compose stop/down`, que
#      envia SIGTERM; rodamos `firebase emulators:export` antes de encerrar.
#   3. snapshot periódico: exporta a cada N segundos enquanto roda. Esta é a
#      única rede de segurança contra encerramento ABRUPTO (PC desligado,
#      `docker kill`, crash, OOM), onde nenhum sinal é processado. Nesse caso
#      perde-se no máximo o trabalho desde o último snapshot.
set -e

DATA_DIR=/data/export
PROJETO=sec-musical-mvp
INTERVALO_SNAPSHOT=${INTERVALO_SNAPSHOT:-300}  # segundos (padrão: 5 min)
mkdir -p "$DATA_DIR"

encerrar() {
  echo "[emuladores] Sinal recebido; exportando estado para $DATA_DIR ..."
  # Export explícito enquanto o hub ainda está vivo.
  firebase emulators:export "$DATA_DIR" --force --project "$PROJETO" || \
    echo "[emuladores] AVISO: export falhou"
  # Encerra o loop de snapshot e o processo dos emuladores.
  [ -n "$SNAPSHOT_PID" ] && kill -TERM "$SNAPSHOT_PID" 2>/dev/null || true
  if [ -n "$EMU_PID" ]; then
    kill -TERM "$EMU_PID" 2>/dev/null || true
    wait "$EMU_PID" 2>/dev/null || true
  fi
  exit 0
}
trap encerrar TERM INT

# Snapshot periódico: rede de segurança contra encerramento abrupto (ex.: PC
# desligado sem `docker compose stop`). Grava em disco a cada INTERVALO_SNAPSHOT.
snapshot_periodico() {
  while true; do
    sleep "$INTERVALO_SNAPSHOT"
    if firebase emulators:export "$DATA_DIR" --force --project "$PROJETO" >/dev/null 2>&1; then
      echo "[emuladores] snapshot periódico salvo em $DATA_DIR ($(date '+%H:%M:%S'))"
    else
      echo "[emuladores] AVISO: snapshot periódico falhou"
    fi
  done
}

# Importa o estado anterior apenas se houver um export válido (evita erro no 1º boot).
IMPORT_ARG=""
if [ -f "$DATA_DIR/firebase-export-metadata.json" ]; then
  echo "[emuladores] Importando estado persistido de $DATA_DIR"
  IMPORT_ARG="--import=$DATA_DIR"
else
  echo "[emuladores] Sem estado prévio; iniciando limpo"
fi

# --export-on-exit como rede de segurança adicional ao trap (saída limpa).
firebase emulators:start \
  --only auth,firestore,storage,functions \
  --project "$PROJETO" \
  $IMPORT_ARG \
  --export-on-exit="$DATA_DIR" &

EMU_PID=$!

# Inicia o snapshot periódico em segundo plano.
snapshot_periodico &
SNAPSHOT_PID=$!

# Mantém o container vivo aguardando o processo dos emuladores; o trap cuida do encerramento.
wait "$EMU_PID"
