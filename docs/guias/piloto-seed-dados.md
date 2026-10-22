# Dados iniciais do piloto (seed) — referência de contrato

Estrutura exata dos documentos iniciais, conforme o contrato de dados. Usar como
referência ao criar dados no ambiente real (Console/Firestore) ou no emulador.

> Regras: não inventar campos. `id_usuario` deve ser o UID do Firebase Auth.
> Datas usam `Timestamp` (no Console, tipo "timestamp"; em código, `serverTimestamp()`).

## setores
Coleção `setores`, doc id = `id_setor`.
```json
{
  "id_setor": "cachoeira",
  "nome": "Cachoeira Paulista - SP",
  "ativo": true,
  "data_criacao": "<timestamp>",
  "data_atualizacao": "<timestamp>"
}
```

## usuarios
Coleção `usuarios`, doc id = UID do Auth.
`cargo`: rótulo de exibição (ex.: "Secretário Musical", "Encarregado Local"); não
autoriza. `capabilities`: mapa booleano que define a autorização (Spec 22/23).
`ids_setor`: array. `primeiro_acesso` (opcional, Spec 20): `true` para usuários
novos com senha padrão (força a troca no primeiro login); ausência = `false`.
```json
{
  "id_usuario": "<uid_auth>",
  "nome_completo": "Nome do Responsável",
  "email": "responsavel@exemplo.com",
  "celular": "",
  "comum_congregacao": "Quilombo",
  "cargo": "Secretário Musical",
  "ativo": true,
  "ids_setor": ["cachoeira"],
  "capabilities": {
    "biblioteca_ler_publicos": true,
    "biblioteca_ler_privados": true,
    "biblioteca_gerenciar_setor": true,
    "biblioteca_gerenciar_global": false,
    "solicitacoes_criar": false,
    "solicitacoes_ver_proprias": true,
    "solicitacoes_ver_setor": true,
    "solicitacoes_agir_setor": true,
    "usuarios_ver": false,
    "usuarios_gerenciar": false
  },
  "primeiro_acesso": true,
  "data_criacao": "<timestamp>",
  "data_atualizacao": "<timestamp>"
}
```

## arquivos (primeiros documentos da Biblioteca)
Coleção `arquivos`, doc id = `id_arquivo`.
`id_nuvem`: `biblioteca/{id_setor}/nivel_1|nivel_2/{id_arquivo}.pdf`.
`arquivo_privado`: `false` = público (nivel_1); `true` = privado (nivel_2).
```json
{
  "id_setor": "cachoeira",
  "escopo": "setor",
  "tipo": "circulares",
  "titulo": "Circular inicial",
  "arquivo_privado": false,
  "id_nuvem": "biblioteca/cachoeira/nivel_1/<id_arquivo>.pdf",
  "id_usuario": "<uid_admin>",
  "data_inclusao": "<timestamp>",
  "data_atualizacao": "<timestamp>"
}
```

## Observações
- `solicitacoes` nascem pelo uso (usuário abre pela interface); não precisa seed.
  - Campos de exibição `nome_solicitante` (gravado na criação) e `nome_responsavel`
    (gravado ao assumir) evitam expor `id` na interface.
- Os arquivos usam o Storage emulator local (modo `emulador`); o `id_nuvem`
  já deve seguir o formato oficial para migração ao Storage de produção sem retrabalho.
