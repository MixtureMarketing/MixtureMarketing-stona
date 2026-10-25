/**
 * Portal klienta przeniesiony do Mixture CRM (decyzja Karola z 25.10.2026): każde /api/portal/* odpowiada
 * 410 Gone, zanim cokolwiek przeczyta z bazy albo z R2 (_shared/panel.ts). Endpointy portalu zostają
 * w repo do usunięcia w osobnym PR.
 */
import { przeniesione } from '../_shared/panel';

export const onRequest: PagesFunction = async () => przeniesione();
