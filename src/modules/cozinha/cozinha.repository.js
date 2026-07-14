import { query } from '../../database/pool.js';

export async function getCozinhaConfiguracao() {
  const result = await query(
    `select id, modo_operacao, agrupar_entrega_mesa, agrupar_producao_semelhantes,
       tolerancia_minutos, alerta_fila_minutos, perfis_visao_consolidada, criado_em, atualizado_em
     from cozinha_configuracoes
     order by id
     limit 1`,
  );

  return result.rows[0] || null;
}

export async function updateCozinhaConfiguracao(configuracao) {
  const current = await getCozinhaConfiguracao();

  if (!current) {
    const created = await query(
      `insert into cozinha_configuracoes (
         modo_operacao,
         agrupar_entrega_mesa,
         agrupar_producao_semelhantes,
         tolerancia_minutos,
         alerta_fila_minutos,
         perfis_visao_consolidada,
         atualizado_em
       )
       values ($1, $2, $3, $4, $5, $6, now())
       returning id, modo_operacao, agrupar_entrega_mesa, agrupar_producao_semelhantes,
         tolerancia_minutos, alerta_fila_minutos, perfis_visao_consolidada, criado_em, atualizado_em`,
      [
        configuracao.modoOperacao,
        configuracao.agruparEntregaMesa,
        configuracao.agruparProducaoSemelhantes,
        configuracao.toleranciaMinutos,
        configuracao.alertaFilaMinutos,
        configuracao.perfisVisaoConsolidada,
      ],
    );

    return created.rows[0];
  }

  const result = await query(
    `update cozinha_configuracoes
     set modo_operacao = $2,
       agrupar_entrega_mesa = $3,
       agrupar_producao_semelhantes = $4,
       tolerancia_minutos = $5,
       alerta_fila_minutos = $6,
       perfis_visao_consolidada = $7,
       atualizado_em = now()
     where id = $1
     returning id, modo_operacao, agrupar_entrega_mesa, agrupar_producao_semelhantes,
       tolerancia_minutos, alerta_fila_minutos, perfis_visao_consolidada, criado_em, atualizado_em`,
    [
      current.id,
      configuracao.modoOperacao,
      configuracao.agruparEntregaMesa,
      configuracao.agruparProducaoSemelhantes,
      configuracao.toleranciaMinutos,
      configuracao.alertaFilaMinutos,
      configuracao.perfisVisaoConsolidada,
    ],
  );

  return result.rows[0];
}

export async function listCozinhaEstacoes() {
  const result = await query(
    `select id, nome, slug, ativo, criado_em, atualizado_em
     from cozinha_estacoes
     order by ativo desc, nome`,
  );

  return result.rows;
}

export async function createCozinhaEstacao({ nome, slug }) {
  const result = await query(
    `insert into cozinha_estacoes (nome, slug, ativo, atualizado_em)
     values ($1, $2, true, now())
     returning id, nome, slug, ativo, criado_em, atualizado_em`,
    [nome, slug],
  );

  return result.rows[0];
}

export async function updateCozinhaEstacao(id, { nome, slug, ativo }) {
  const result = await query(
    `update cozinha_estacoes
     set nome = $2,
       slug = $3,
       ativo = $4,
       atualizado_em = now()
     where id = $1
     returning id, nome, slug, ativo, criado_em, atualizado_em`,
    [id, nome, slug, ativo],
  );

  return result.rows[0];
}

export async function deleteCozinhaEstacao(id) {
  await query(
    `update itens_cardapio
     set cozinha_estacao_id = null,
       atualizado_em = now()
     where cozinha_estacao_id = $1`,
    [id],
  );

  const result = await query(
    `delete from cozinha_estacoes
     where id = $1
     returning id`,
    [id],
  );

  return result.rows[0];
}
