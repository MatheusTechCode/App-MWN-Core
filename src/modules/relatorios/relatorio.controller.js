import { asyncHandler } from '../../utils/asyncHandler.js';
import { getSalesDashboard } from './relatorio.service.js';

export const relatorioController = {
  salesDashboard: asyncHandler(async (req, res) => {
    res.json(await getSalesDashboard());
  }),
};
