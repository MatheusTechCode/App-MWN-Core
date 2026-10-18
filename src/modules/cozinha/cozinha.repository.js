import { query } from '../../database/pool.js';

export async function getCozinhaConfiguracao() {
  const result = await query(
    `select id, modo_operacao, modo_producao, agrupar_entrega_mesa, agrupar_producao_semelhantes,
       agrupar_pedidos_fila, tolerancia_minutos, alerta_fila_minutos, perfis_visao_consolidada, criado_em, atualizado_em
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
         modo_producao,
         agrupar_entrega_mesa,
         agrupar_producao_semelhantes,
         agrupar_pedidos_fila,
         tolerancia_minutos,
         alerta_fila_minutos,
         perfis_visao_consolidada,
         atualizado_em
       )
       values ($1, $2, $3, $4, $5, $6, $7, $8, now())
       returning id, modo_operacao, modo_producao, agrupar_entrega_mesa, agrupar_producao_semelhantes,
         agrupar_pedidos_fila, tolerancia_minutos, alerta_fila_minutos, perfis_visao_consolidada, criado_em, atualizado_em`,
      [
        configuracao.modoOperacao,
        configuracao.modoProducao,
        configuracao.agruparEntregaMesa,
        configuracao.agruparProducaoSemelhantes,
        configuracao.agruparPedidosFila,
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
       modo_producao = $3,
       agrupar_entrega_mesa = $4,
       agrupar_producao_semelhantes = $5,
       agrupar_pedidos_fila = $6,
       tolerancia_minutos = $7,
       alerta_fila_minutos = $8,
       perfis_visao_consolidada = $9,
       atualizado_em = now()
     where id = $1
     returning id, modo_operacao, modo_producao, agrupar_entrega_mesa, agrupar_producao_semelhantes,
       agrupar_pedidos_fila, tolerancia_minutos, alerta_fila_minutos, perfis_visao_consolidada, criado_em, atualizado_em`,
    [
      current.id,
      configuracao.modoOperacao,
      configuracao.modoProducao,
      configuracao.agruparEntregaMesa,
      configuracao.agruparProducaoSemelhantes,
      configuracao.agruparPedidosFila,
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
