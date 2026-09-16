// Seed opcional para o EMULADOR local: popula 20 solicitações.
// NÃO usar em produção.
//
// Grava documentos em `solicitacoes` contornando as regras via
// @firebase/rules-unit-testing (as regras reais restringem a escrita direta).
//
// Depende dos setores criados pelo seed de usuários (cachoeira, queluz).
// Rode o seed de usuários antes, se ainda não rodou.
//
// Uso:
//   1) subir emuladores:  docker compose up emuladores   (ou npm run emulators)
//   2) (se necessário)    npm run seed:emulador
//   3) em outro terminal: npm run seed:solicitacoes
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { initializeTestEnvironment } from '@firebase/rules-unit-testing'

const PROJETO = 'sec-musical-mvp'
const EMU_HOST = process.env.EMULATOR_HOST || '127.0.0.1'
const FIRESTORE_PORT = Number(process.env.FIRESTORE_PORT || 8080)

// Valores conforme contrato oficial (src/servicos/casos_de_uso/solicitacoes.js).
const TIPOS = [
  'avaliacao_exame',
  'ingresso_gem',
  'troca_instrumento',
  'compra_manutencao',
  'transferencia',
  'novo_colaborador',
]
const STATUS = ['em_aberto', 'em_andamento', 'concluida', 'cancelada']
const SETORES = ['cachoeira', 'queluz']

// Identificadores de referência para o ambiente local (não são UIDs reais do Auth).
const ID_SOLICITANTE_SEED = 'seed-solicitante'
const NOME_SOLICITANTE_SEED = 'Solicitante Seed'
const ID_RESPONSAVEL_SEED = 'seed-admin'
const NOME_RESPONSAVEL_SEED = 'Administrador Seed'

const COMUNS = ['Central', 'Quilombo', 'Embaú', 'Bairro da Figueira', 'Bairro União']
const BENEFICIARIOS = [
  'João da Silva',
  'Maria Souza',
  'Pedro Oliveira',
  'Ana Santos',
  'Carlos Pereira',
]

// Monta o id_nuvem do anexo final (contrato de solicitações):
// solicitacoes/{id_setor}/{id_solicitante}/{id_solicitacao}/resposta.pdf
function montarIdNuvemResposta(idSetor, idSolicitante, idSolicitacao) {
  return `solicitacoes/${idSetor}/${idSolicitante}/${idSolicitacao}/resposta.pdf`
}

// Gera 20 solicitações distribuídas entre setores, tipos e status.
function gerarSolicitacoes(total = 20) {
  const lista = []
  for (let i = 0; i < total; i += 1) {
    const numero = String(i + 1).padStart(2, '0')
    const idSolicitacao = `seed-solicitacao-${numero}`
    const idSetor = SETORES[i % SETORES.length]
    const tipo = TIPOS[i % TIPOS.length]
    const status = STATUS[i % STATUS.length]
    const comum = COMUNS[i % COMUNS.length]
    const beneficiario = BENEFICIARIOS[i % BENEFICIARIOS.length]

    // Campos dependentes do status, conforme fluxo oficial:
    // - em_andamento/concluida têm responsável;
    // - concluida tem conclusão + anexo final (id_nuvem);
    // - em_aberto/cancelada não têm responsável nem conclusão.
    const temResponsavel = status === 'em_andamento' || status === 'concluida'
    const concluida = status === 'concluida'

    lista.push({
      idSolicitacao,
      id_setor: idSetor,
      id_solicitante: ID_SOLICITANTE_SEED,
      nome_solicitante: NOME_SOLICITANTE_SEED,
      comum_congregacao: comum,
      nome_beneficiario: beneficiario,
      id_responsavel: temResponsavel ? ID_RESPONSAVEL_SEED : '',
      nome_responsavel: temResponsavel ? NOME_RESPONSAVEL_SEED : '',
      tipo,
      status,
      descricao: `Solicitação ${numero} do tipo ${tipo} (dados de seed local).`,
      conclusao: concluida ? `Solicitação ${numero} concluída no ambiente de seed.` : '',
      id_nuvem: concluida ? montarIdNuvemResposta(idSetor, ID_SOLICITANTE_SEED, idSolicitacao) : '',
    })
  }
  return lista
}

async function main() {
  const solicitacoes = gerarSolicitacoes(20)

  const testEnv = await initializeTestEnvironment({
    projectId: PROJETO,
    firestore: { host: EMU_HOST, port: FIRESTORE_PORT },
  })

  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore()
    for (const s of solicitacoes) {
      // Campos exatamente conforme repositorioSolicitacoes.criarSolicitacao
      // (mais os campos preenchidos por status no fluxo admin). Não inventar campos.
      await setDoc(doc(db, 'solicitacoes', s.idSolicitacao), {
        id_setor: s.id_setor,
        id_solicitante: s.id_solicitante,
        nome_solicitante: s.nome_solicitante,
        comum_congregacao: s.comum_congregacao,
        nome_beneficiario: s.nome_beneficiario,
        id_responsavel: s.id_responsavel,
        nome_responsavel: s.nome_responsavel,
        tipo: s.tipo,
        status: s.status,
        descricao: s.descricao,
        conclusao: s.conclusao,
        id_nuvem: s.id_nuvem,
        data_solicitacao: serverTimestamp(),
        data_atualizacao: serverTimestamp(),
      })
    }
  })

  await testEnv.cleanup()

  console.log(`Seed de solicitações concluído: ${solicitacoes.length} solicitações.`)
  const porStatus = {}
  for (const s of solicitacoes) {
    porStatus[s.status] = (porStatus[s.status] || 0) + 1
  }
  for (const [status, qtd] of Object.entries(porStatus)) {
    console.log(`  - ${status}: ${qtd}`)
  }
  process.exit(0)
}

main().catch((e) => {
  console.error('Falha no seed de solicitações:', e)
  process.exit(1)
})
