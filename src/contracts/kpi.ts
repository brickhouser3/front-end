// src/contracts/kpi.ts

export type KpiKey =
  | "volume"
  | "revenue"
  | "share"
  | "pods"
  | "taps"
  | "displays"
  | "avd"
  | "adshare";

export type KpiValue = {
  value: number;
  unit: "bbl" | "usd" | "pct" | "count" | "index";
  vs_ytd_pct: number;
  vs_mom_pct: number;
  vs_target_pct?: number;
};

export type KpiResponseV1 = {
  contract_version: "kpi.v1";
  kpi: KpiKey;
  as_of_rsidat: string;
  period: {
    grain: "month";
    cal_yr_mo_nbr: number;
  };
  scope: {
    geo: "NATIONAL" | "REGION" | "WSLR" | "STATE";
    megabrand?: string;
    channel?: string;
    wslr_nbr?: string;
  };
  data: KpiValue;
};
