export type ApiQueryOk = {
  ok: true;
  result: {
    data_array?: any[][];
    // Databricks returns more too, but we only need this for now
  };
  statement_id?: string;
  state?: string;
};

export type ApiQueryErr = {
  ok: false;
  error: string;
  details?: string;
  [k: string]: any;
};

export type ApiQueryResponse = ApiQueryOk | ApiQueryErr;