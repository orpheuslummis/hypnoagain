/// <reference lib="deno.unstable" />

interface Settings {
  metaPrompt: string;
}

const SETTINGS_KEY = ["settings", "meta_prompt"];

export async function getSettings(): Promise<Settings> {
  try {
    const kv = await Deno.openKv(
      Deno.env.get("DENO_ENV") === "test" ? ":memory:" : undefined,
    );
    const result = await kv.get<Settings>(SETTINGS_KEY);

    if (!result.value) {
      const defaultSettings = { metaPrompt: "" };
      await kv.set(SETTINGS_KEY, defaultSettings);
      return defaultSettings;
    }

    return result.value;
  } catch (error) {
    console.error("KV Error:", error);
    return { metaPrompt: "" };
  }
}

export async function updateSettings(newMetaPrompt: string): Promise<void> {
  try {
    const kv = await Deno.openKv(
      Deno.env.get("DENO_ENV") === "test" ? ":memory:" : undefined,
    );
    await kv.set(SETTINGS_KEY, { metaPrompt: newMetaPrompt });
  } catch (error) {
    console.error("KV Error:", error);
    throw error;
  }
}
