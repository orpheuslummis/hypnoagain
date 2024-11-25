import { useState } from "preact/hooks";

export default function RecordAudio() {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [_mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const getSupportedMimeType = () => {
    const types = [
      "audio/webm",
      "audio/webm;codecs=opus",
      "audio/mp4",
      "audio/mp4;codecs=mp4a.40.2",
    ];
    return types.find((type) => MediaRecorder.isTypeSupported(type)) ||
      "audio/webm";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 44100,
        },
      });
      setMediaStream(stream);

      const recorder = new MediaRecorder(stream, {
        mimeType: getSupportedMimeType(),
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

        // Clean up the stream
        stream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);
      };

      recorder.start(200);
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone", error);
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        alert(
          "Microphone access was denied. Please allow microphone access in your browser settings.",
        );
      } else if (
        error instanceof DOMException && error.name === "NotFoundError"
      ) {
        alert(
          "No microphone found. Please ensure your device has a working microphone.",
        );
      } else {
        alert(
          "Could not access microphone. Please check permissions and try again.",
        );
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
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
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4 gap-4">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        class="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg text-lg transition-colors"
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
