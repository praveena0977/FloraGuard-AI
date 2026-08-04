import { Prediction } from "../types";

const TOKEN_KEY = "flora_guard_token";

export async function predictPlantDisease(base64Image: string): Promise<Partial<Prediction>> {
  const token = localStorage.getItem(TOKEN_KEY);

  const res = await fetch("/api/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ image: base64Image }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Prediction failed" }));
    throw new Error(err.error || "Prediction failed");
  }

  const data = await res.json();
  return data.prediction;
}
