# Dados iniciais do piloto (seed) — referência de contrato

Estrutura exata dos documentos iniciais, conforme o contrato de dados. Usar como
referência ao criar dados no ambiente real (Console/Firestore) ou no emulador.

> Regras: não inventar campos. `id_usuario` deve ser o UID do Firebase Auth.
> Datas usam `Timestamp` (no Console, tipo "timestamp"; em código, `serverTimestamp()`).

## setores
Coleção `setores`, doc id = `id_setor`.
```json
{
  "id_setor": "setorA",
  "nome": "Setor A",
  "ativo": true,
  "data_criacao": "<timestamp>",
  "data_atualizacao": "<timestamp>"
}
```

## usuarios
Coleção `usuarios`, doc id = UID do Auth.
`nivel_acesso`: 1 = usuário, 2 = admin. `ids_setor`: array.
```json
{
  "id_usuario": "<uid_auth>",
  "nome_completo": "Nome do Responsável",
  "email": "responsavel@exemplo.com",
  "celular": "",
  "comum_congregacao": "Quilombo",
  "nivel_acesso": 2,
  "ativo": true,
  "ids_setor": ["setorA"],
  "data_criacao": "<timestamp>",
  "data_atualizacao": "<timestamp>"
}
```

## arquivos (primeiros documentos da Biblioteca)
Coleção `arquivos`, doc id = `id_arquivo`.
`id_nuvem`: `biblioteca/{id_setor}/nivel_1|nivel_2/{id_arquivo}.pdf`.
```json
{
  "id_setor": "setorA",
  "tipo": "circulares",
  "titulo": "Circular inicial",
  "nivel_acesso": 1,
  "id_nuvem": "biblioteca/setorA/nivel_1/<id_arquivo>.pdf",
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
