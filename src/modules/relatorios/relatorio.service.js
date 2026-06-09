import { findConfirmedSaleItems, findConfirmedSales } from './relatorio.repository.js';

const timeZone = 'America/Sao_Paulo';

function dateKey(value) {
  return new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone,
    year: 'numeric',
  }).format(new Date(value));
}

function labelForDate(value) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    timeZone,
  }).format(value);
}

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function lastDays(amount) {
  return Array.from({ length: amount }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (amount - index - 1));
    return { date, key: dateKey(date) };
  });
}

export async function getSalesDashboard() {
  const [sales, saleItems] = await Promise.all([
    findConfirmedSales(),
    findConfirmedSaleItems(),
  ]);
  const todayKey = dateKey(new Date());
  const todaySales = sales.filter((sale) => dateKey(sale.criado_em) === todayKey);
  const todayItems = saleItems.filter((item) => dateKey(item.criado_em) === todayKey);
  const totalToday = todaySales.reduce((sum, sale) => sum + Number(sale.valor), 0);
  const itemCountToday = todayItems.reduce((sum, item) => sum + Number(item.quantidade), 0);

  const salesByDay = lastDays(7).map(({ date, key }) => ({
    data: key,
    label: labelForDate(date),
    total: roundMoney(
      sales
        .filter((sale) => dateKey(sale.criado_em) === key)
        .reduce((sum, sale) => sum + Number(sale.valor), 0),
    ),
  }));

  const itemTotals = new Map();
  for (const item of todayItems) {
    const current = itemTotals.get(item.item_id) || {
      id: item.item_id,
      nome: item.nome,
      categoria: item.categoria,
      quantidade: 0,
      total: 0,
    };
    current.quantidade += Number(item.quantidade);
    current.total += Number(item.quantidade) * Number(item.preco_unitario);
    itemTotals.set(item.item_id, current);
  }

  const paymentTotals = new Map();
  const tableTotals = new Map();
  for (const sale of todaySales) {
    const paymentMethod = sale.forma_pagamento || 'não informado';
    paymentTotals.set(paymentMethod, (paymentTotals.get(paymentMethod) || 0) + Number(sale.valor));

    const currentTable = tableTotals.get(sale.mesa_numero) || {
      mesa: sale.mesa_numero,
      comandas: 0,
      total: 0,
    };
    currentTable.comandas += 1;
    currentTable.total += Number(sale.valor);
    tableTotals.set(sale.mesa_numero, currentTable);
  }

  return {
    geradoEm: new Date().toISOString(),
    resumo: {
      totalVendas: roundMoney(totalToday),
      ticketMedio: roundMoney(todaySales.length ? totalToday / todaySales.length : 0),
      comandasFechadas: todaySales.length,
      itensVendidos: itemCountToday,
    },
    vendasUltimosSeteDias: salesByDay,
    itensMaisVendidos: [...itemTotals.values()]
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5)
      .map((item) => ({ ...item, total: roundMoney(item.total) })),
    formasPagamento: [...paymentTotals.entries()]
      .map(([forma, total]) => ({ forma, total: roundMoney(total) }))
      .sort((a, b) => b.total - a.total),
    mesasDestaque: [...tableTotals.values()]
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((table) => ({ ...table, total: roundMoney(table.total) })),
    ultimasVendas: sales.slice(0, 8).map((sale) => ({
      id: sale.id,
      comandaId: sale.comanda_id,
      cliente: sale.nome_cliente,
      mesa: sale.mesa_numero,
      valor: roundMoney(sale.valor),
      formaPagamento: sale.forma_pagamento,
      criadoEm: sale.criado_em,
    })),
  };
}
