import { useEffect, useState } from "preact/hooks";

export default function FullScreenImage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch("/api/get-latest-image");
        if (!response.ok) throw new Error("Failed to fetch image");
        const data = await response.json();
        if (data.imageUrl !== imageUrl) {
          setImageUrl(data.imageUrl);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load image");
      }
    };

    fetchImage();
    const interval = setInterval(fetchImage, 1000);
    return () => clearInterval(interval);
  }, [imageUrl]);

  if (error) {
    return (
      <div class="fixed inset-0 flex items-center justify-center bg-red-100">
        <div class="text-red-600 text-xl">Error: {error}</div>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div class="fixed inset-0 flex items-center justify-center bg-black">
        <div class="text-gray-300 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div class="fixed inset-0 flex items-center justify-center bg-black">
      <img
        src={imageUrl}
        alt="Generated image"
        class="w-full h-full object-contain"
      />
    </div>
  );
}
