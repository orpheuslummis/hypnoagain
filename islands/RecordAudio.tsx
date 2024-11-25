import { useState } from "preact/hooks";

export default function RecordAudio() {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        if (audioBlob.size > 0) {
          await submitAudio(audioBlob);
        } else {
          alert("No audio was recorded. Please try again.");
        }
      };

      recorder.start(200);
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const submitAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    try {
      const response = await fetch("/api/process", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }
    } catch (error) {
      console.error("Error processing audio", error);
      alert("Failed to process audio. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div class="min-h-screen flex flex-col items-center justify-center bg-[#86efac] p-4">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        class="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-full text-xl font-bold transition-colors"
        disabled={isProcessing}
      >
        {isProcessing
          ? "Processing..."
          : isRecording
          ? "Stop Recording"
          : "Start Recording"}
      </button>
    </div>
  );
}
