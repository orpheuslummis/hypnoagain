import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: Deno.env.get("ASSEMBLYAI_API_KEY") || "",
});

let latestImage: { transcription: string; imageUrl: string } | null = null;

async function generateImage(prompt: string) {
  const metaPrompt =
    "inspired by but not exactly Remedios Varo and Joan Miró ... surrealist dreamlike imagery, melting psychedelic";
  const fullPrompt = `${metaPrompt}, ${prompt}`;

  const response = await fetch(
    "https://api.together.xyz/v1/images/generations",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("TOGETHER_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "black-forest-labs/FLUX.1-schnell-Free",
        prompt: fullPrompt,
        width: 1024,
        height: 768,
        steps: 4,
        n: 1,
        response_format: "b64_json",
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Together API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].b64_json;
}

async function transcribeAudio(audioFile: File): Promise<string> {
  try {
    if (audioFile.size === 0) {
      throw new Error(`Empty audio file: ${audioFile.name}`);
    }

    const transcript = await client.transcripts.transcribe({
      audio: await audioFile.arrayBuffer(),
    });

    if (transcript.status === "error") {
      throw new Error(transcript.error);
    }

    return transcript.text || "No transcription available";
  } catch (error) {
    console.error("Transcription Error:", error);
    throw error;
  }
}

export const handler = async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return new Response("No audio file", { status: 400 });
    }

    const transcription = await transcribeAudio(audioFile);
    const imageBase64 = await generateImage(transcription);

    latestImage = {
      transcription,
      imageUrl: `data:image/jpeg;base64,${imageBase64}`,
    };

    return new Response(JSON.stringify(latestImage), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Processing error:", errorMessage);
    return new Response(`Error processing request: ${errorMessage}`, {
      status: 500,
    });
  }
};

export const getLatestImage = () => {
  return new Response(
    JSON.stringify(latestImage || { imageUrl: null }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
};
