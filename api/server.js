
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.get("/api/query", async (_req, res) => {
  const host = process.env.DATABRICKS_HOST;
  const token = process.env.DATABRICKS_TOKEN;
  const warehouseId = process.env.WAREHOUSE_ID;

  const payload = {
    statement: "SELECT * FROM main.sales.customers LIMIT 10",
    warehouse_id: warehouseId,
    disposition: "INLINE",
    format: "JSON_ARRAY",
    wait_timeout: "10s",
    on_wait_timeout: "CONTINUE"
  };

  const resp = await fetch(`${host}/api/2.0/sql/statements`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const json = await resp.json();
  if (json.status?.state === "SUCCEEDED" && json.result?.data_array) {
    res.json(json.result.data_array);
  } else {
    res.json(json);
  }
});

app.listen(3001, () => console.log("API running on port 3001
