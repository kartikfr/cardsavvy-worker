import { createAdminClient } from "@/lib/supabase/server";

type SystemSettingRow = {
  key: string;
  value: unknown;
};

function readStringKey(value: unknown, keys: string[]): string {
  if (!value || typeof value !== "object") return "";
  const obj = value as Record<string, unknown>;
  for (const key of keys) {
    const candidate = obj[key];
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }
  return "";
}

function extractGeminiKeyFromSetting(setting: SystemSettingRow): string {
  const { key, value } = setting;

  if (key === "gemini_api_key") {
    if (typeof value === "string") return value.trim();
    return readStringKey(value, ["gemini_api_key", "api_key", "apiKey"]);
  }

  if (!value || typeof value !== "object") return "";
  const provider = String((value as Record<string, unknown>).provider ?? "").toLowerCase();

  if (provider && provider !== "google" && provider !== "gemini") {
    return "";
  }

  return readStringKey(value, ["apiKey", "api_key", "gemini_api_key"]);
}

export async function resolveGeminiApiKey(): Promise<string> {
  const envKey = process.env.GEMINI_API_KEY?.trim() ?? "";
  if (envKey) return envKey;

  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("system_settings")
      .select("key,value")
      .in("key", ["gemini_api_key", "ai_provider_config", "ai_processor_config"]);

    if (error || !data?.length) return "";

    const priority = ["gemini_api_key", "ai_provider_config", "ai_processor_config"];
    const sorted = [...(data as SystemSettingRow[])].sort(
      (a, b) => priority.indexOf(a.key) - priority.indexOf(b.key)
    );

    for (const setting of sorted) {
      const key = extractGeminiKeyFromSetting(setting);
      if (key) return key;
    }
  } catch {
    return "";
  }

  return "";
}
