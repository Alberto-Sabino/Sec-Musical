# Spec 05 — Biblioteca admin: cadastro, edição, remoção e auditoria

## Objetivo
Permitir que o Admin mantenha a biblioteca oficial do setor com fluxo simples, seguro e rastreável.

## Atores
- Admin

---

## Escopo desta spec
Inclui:
- cadastro de novo arquivo;
- edição de metadados;
- substituição de arquivo;
- remoção de arquivo;
- auditoria básica de alterações.

Não inclui:
- versionamento rico de documentos;
- recuperação avançada de versões;
- aprovação por múltiplos responsáveis.

---

## Campos mínimos do cadastro
- `id_setor`
- `tipo`
- `titulo`
- `nivel_acesso`
- arquivo

Campos de sistema:
- `id_arquivo`
- `id_nuvem`
- `id_usuario`
- `data_inclusao`
- `data_atualizacao`

---

## Regras de acesso
- somente Admin pode acessar esta experiência;
- o Admin só pode operar sobre arquivos do setor ativo e dos setores aos quais pertence;
- o `id_nuvem` deve respeitar o padrão definido para biblioteca;
- o fluxo de upload deve concluir no Storage antes da persistência final no Firestore.

---

## Fluxo de novo arquivo
1. Admin acessa a tela de cadastro.
2. Informa metadados e seleciona o arquivo.
3. O sistema gera `id_arquivo`.
4. O sistema monta `id_nuvem`.
5. O arquivo é enviado ao Storage.
6. Após sucesso, os metadados são gravados em `arquivos`.
7. O sistema registra auditoria mínima.

---

## Fluxo de edição
- o Admin pode alterar metadados;
- se houver troca de arquivo, o sistema envia o novo arquivo antes de atualizar a referência final;
- ao fim, grava `data_atualizacao` e registra auditoria.

---

## Fluxo de remoção
- o Admin confirma a remoção;
- o sistema remove a referência e o arquivo conforme a estratégia adotada;
- o MVP pode manter exclusão real, sem lixeira funcional;
- a ação deve registrar auditoria mínima.

---

## Auditoria mínima esperada
Em `arquivos/{id_arquivo}/auditoria`, registrar no mínimo:
- ação executada
- `id_usuario`
- data da ação

Ações mínimas recomendadas:
- criado
- atualizado
- removido

---

## Estados importantes
- carregando formulário
- enviando arquivo
- salvando metadados
- sucesso
- erro de upload
- erro de persistência
- confirmação de remoção

---

## Regras de UX mínimas
- deixar claro o setor e o nível de acesso selecionado;
- permitir revisão antes de salvar;
- mostrar feedback durante upload;
- evitar criação de registro sem arquivo válido;
- exigir confirmação antes da remoção.

---

## Critérios de aceite
- Admin consegue cadastrar arquivo com upload e persistência corretos;
- `id_nuvem` segue o padrão definido;
- o arquivo só aparece na biblioteca após gravação bem-sucedida;
- Admin consegue editar metadados e substituir conteúdo;
- Admin consegue remover o arquivo;
- cada ação principal gera auditoria mínima.

---

## Dependências
- Spec 02 — Autenticação, sessão e contexto do usuário
- Spec 03 — Design system base e layout mobile-first
- Spec 04 — Biblioteca: consulta, listagem, filtro e download

---

## Diretriz final
A experiência administrativa da biblioteca deve ser **leve, segura e orientada a evitar inconsistência entre arquivo físico e metadados persistidos**.