import { Handlers, PageProps } from "$fresh/server.ts";

export const handler: Handlers = {
  async GET(_req, ctx) {
    const response = await fetch(`${new URL(_req.url).origin}/api/process`, {
      method: "GET",
    });
    const data = await response.json();
    return ctx.render(data);
  },
};

export default function SettingsPage(
  { data }: PageProps<{ metaPrompt: string }>,
) {
  return (
    <div class="min-h-screen bg-gray-900 p-4">
      <div class="max-w-lg mx-auto">
        <h1 class="text-white text-2xl mb-4">Image Generation Settings</h1>
        <form method="POST" action="/api/process">
          <textarea
            name="metaPrompt"
            class="w-full bg-gray-700 text-white p-2 rounded-lg mb-4"
            rows={4}
            placeholder="Enter meta prompt for image generation..."
            value={data.metaPrompt}
          />
          <div class="flex justify-between">
            <button
              type="submit"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Save
            </button>
            <a
              href="/"
              class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Back to Recording
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
