# Spec 07 — Solicitações admin: fila, tratamento, resposta, anexo final e conclusão

## Objetivo
Permitir que o Admin trate as solicitações do setor dentro da plataforma, com fluxo controlado, rastreável e consistente.

## Atores
- Admin

---

## Escopo desta spec
Inclui:
- fila do admin por setor ativo;
- filtro por status;
- detalhe administrativo da solicitação;
- assumir solicitação;
- resposta ao solicitante (`conclusao`);
- upload do anexo final;
- conclusão;
- cancelamento operacional.

Não inclui:
- múltiplos responsáveis simultâneos;
- comentários internos separados;
- múltiplos anexos;
- workflow avançado de aprovação.

---

## Regras de acesso
- o Admin vê apenas solicitações de setores aos quais pertence;
- a interface deve operar com um setor ativo por vez;
- apenas Admin pode assumir, responder, anexar resposta final, concluir ou cancelar operacionalmente;
- uma vez assumida, a solicitação só pode ser alterada pelo responsável que a assumiu;
- o anexo final segue o padrão de `id_nuvem` definido para solicitações;
- o Admin envia o anexo final, mas **não o lê**: o download é restrito ao próprio solicitante.

---

## Fluxo de listagem
1. Admin acessa a fila do setor ativo.
2. O sistema carrega as solicitações do setor.
3. A listagem pode ser filtrada por status.
4. O Admin abre a solicitação para tratamento.

---

## Fluxo de assumir solicitação
- a ação só é permitida se a solicitação ainda estiver `em_aberto`;
- deve acontecer com transação;
- ao assumir, o sistema grava:
- `status = em_andamento`
- `id_responsavel = admin atual`
- `nome_responsavel = nome do admin atual`
- `data_atualizacao`
- a partir daí, somente esse responsável pode tratar a solicitação.

---

## Fluxo de resposta (`conclusao`)
- o responsável registra a resposta no campo `conclusao`;
- a `conclusao` só pode ser gravada ou alterada enquanto a solicitação está `em_andamento`;
- ela fica visível ao solicitante apenas quando a solicitação estiver `concluida`;
- na interface, esse campo aparece com o rótulo "Comentário"; o campo persistido é `conclusao`;
- o tamanho respeita o limite definido para o MVP.

---

## Fluxo de anexo final
1. Admin seleciona o arquivo final.
2. O sistema monta `id_nuvem` da solicitação.
3. Envia o arquivo ao Storage.
4. Após sucesso, atualiza a solicitação com a referência do arquivo.
5. Mantém rastreabilidade mínima da ação.

---

## Fluxo de conclusão
- a conclusão ocorre após o tratamento administrativo;
- o sistema atualiza `status = concluida`;
- o usuário passa a poder baixar o arquivo final;
- a ação deve registrar atualização e auditoria mínima.

---

## Fluxo de cancelamento
- pode acontecer conforme necessidade operacional;
- respeita as transições válidas do MVP;
- encerra o fluxo da solicitação no sistema.

---

## Dados importantes no detalhe administrativo
- tipo da solicitação
- solicitante
- pessoa afetada (`nome_beneficiario`)
- status
- resposta atual (`conclusao`)
- responsável, se houver
- datas principais
- ação de upload do anexo final
- ação de concluir ou cancelar

---

## Estados importantes
- carregando fila
- fila vazia
- filtro sem resultados
- carregando detalhe
- assumindo solicitação
- upload em andamento
- conclusão com sucesso
- erro de concorrência ao assumir
- erro de upload

---

## Regras de UX mínimas
- o Admin deve identificar rapidamente o status e o tipo da solicitação;
- a ação de assumir deve ser clara e segura;
- o setor ativo precisa estar visível na experiência;
- comentário, upload e conclusão devem seguir ordem intuitiva;
- erros de concorrência e permissão devem ter mensagem compreensível.

---

## Critérios de aceite
- a fila mostra apenas solicitações do setor ativo do Admin;
- o filtro por status funciona;
- assumir solicitação usa transação e respeita concorrência;
- `id_responsavel` é preenchido corretamente;
- o upload do anexo final grava `id_nuvem` válido;
- a conclusão libera download ao Usuário;
- cancelamento respeita o fluxo permitido.

---

## Dependências
- Spec 02 — Autenticação, sessão e contexto do usuário
- Spec 03 — Design system base e layout mobile-first
- Spec 06 — Solicitações do usuário: criação, acompanhamento, edição, cancelamento e download

---

## Diretriz final
A experiência do Admin deve tirar a operação do campo informal e colocá-la em uma fila **organizada, clara e segura**, sem complexidade além da necessária para o MVP.