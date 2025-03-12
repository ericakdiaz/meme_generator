"use client";

import { useState } from "react";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";

export default function Home() {
  const [meme, setMeme] = useState<{
    id: string;
    imageUrl: string;
    votes: number;
    template?: string;
    category?: string;
    reasoning?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const generateMeme = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/generate-meme", {
        method: "POST",
      });
      const data = await response.json();

      // Parse the metadata from the URL if it exists
      const imageUrl = data.imageUrl;
      if (imageUrl.startsWith("METADATA:")) {
        // Find the last occurrence of METADATA: and split from there
        const metadataPrefix = "METADATA:";
        const metadataStart =
          imageUrl.indexOf(metadataPrefix) + metadataPrefix.length;
        const [category, concept, ...urlParts] = imageUrl
          .slice(metadataStart)
          .split(":");
        const url = urlParts.join(":"); // Rejoin the URL parts with colons
        setMeme({
          ...data,
          imageUrl: url, // Use the actual image URL for display
        });
      } else {
        setMeme(data);
      }
    } catch (error) {
      console.error("Error generating meme:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (type: "up" | "down") => {
    if (!meme) return;
    try {
      await fetch("/api/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memeId: meme.id,
          voteType: type,
        }),
      });
      setMeme((prev) =>
        prev
          ? {
              ...prev,
              votes: prev.votes + (type === "up" ? 1 : -1),
            }
          : null
      );
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex flex-col items-center p-4">
        <button
          onClick={generateMeme}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          {loading ? "Generating..." : "Generate New Meme"}
        </button>
      </div>

      {meme && (
        <div className="flex-1 flex items-center px-4 pb-4">
          <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-center bg-gray-50 p-4">
              <img
                src={meme.imageUrl}
                alt="Generated meme"
                className="max-h-[60vh] w-auto object-contain"
              />
            </div>
            <div className="p-4 border-t">
              {meme.template && (
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  {meme.template}
                </h2>
              )}
              {meme.reasoning && (
                <p className="text-gray-600 text-sm mb-4">{meme.reasoning}</p>
              )}
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <button
                    onClick={() => handleVote("up")}
                    className="flex items-center gap-2 text-gray-600 hover:text-green-500"
                  >
                    <FaThumbsUp />
                  </button>
                  <button
                    onClick={() => handleVote("down")}
                    className="flex items-center gap-2 text-gray-600 hover:text-red-500"
                  >
                    <FaThumbsDown />
                  </button>
                </div>
                <span className="text-lg font-semibold text-gray-700">
                  Votes: {meme.votes}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
