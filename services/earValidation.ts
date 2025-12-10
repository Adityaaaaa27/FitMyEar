import * as FileSystem from "expo-file-system/legacy";

const API_BASE = "http://192.168.1.42:8000"; // your PC IP

export async function validateEar(uri: string) {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: "base64",
  });

  const res = await fetch(`${API_BASE}/validate-ear`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_base64: base64 }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error("Validation failed: " + txt);
  }

  return res.json() as Promise<{
    predictedClass: string;
    earConfidence: number;
    isEar: boolean;
  }>;
}
