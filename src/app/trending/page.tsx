"use client";

import { useState, useEffect, useRef } from "react";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";

interface Meme {
  id: number;
  imageUrl: string;
  votes: number;
  createdAt: string;
}

export default function TrendingPage() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchTrendingMemes = async (page?: string) => {
    try {
      const url = new URL("/api/trending-memes", window.location.origin);
      if (page) {
        url.searchParams.set("page", page);
      }

      const response = await fetch(url);
      const data = await response.json();

      console.log("Fetched data:", { page, data });

      // Parse metadata from URLs before setting state
      const processedMemes = data.items.map((meme: any) => {
        const imageUrl = meme.imageUrl;
        if (imageUrl.startsWith("METADATA:")) {
          const metadataPrefix = "METADATA:";
          const metadataStart =
            imageUrl.indexOf(metadataPrefix) + metadataPrefix.length;
          const [category, concept, ...urlParts] = imageUrl
            .slice(metadataStart)
            .split(":");
          let url = urlParts.join(":"); // Rejoin the URL parts with colons

          // Fix local image URLs to use the correct API route
          if (url.startsWith("/tmp/")) {
            url = `/api${url}`;
          }

          return {
            ...meme,
            id: Number(meme.id),
            imageUrl: url,
          };
        }
        return {
          ...meme,
          id: Number(meme.id),
        };
      });

      if (page) {
        setMemes((prev) => [...prev, ...processedMemes]);
      } else {
        setMemes(processedMemes);
      }
      setNextPage(data.nextPage);
    } catch (error) {
      console.error("Error fetching trending memes:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchTrendingMemes();
  }, []);

  const loadMore = () => {
    if (loadingMore || !nextPage) return;
    console.log("Loading more with page:", nextPage);
    setLoadingMore(true);
    fetchTrendingMemes(nextPage);
  };

  // Intersection Observer for infinite scroll
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextPage && !loadingMore) {
          console.log("Observer triggered, loading more");
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [nextPage, loadingMore]);

  const handleVote = async (memeId: number, type: "up" | "down") => {
    try {
      await fetch("/api/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memeId,
          voteType: type,
        }),
      });

      setMemes((prevMemes) =>
        prevMemes.map((meme) =>
          meme.id === memeId
            ? { ...meme, votes: meme.votes + (type === "up" ? 1 : -1) }
            : meme
        )
      );
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-xl">Loading trending memes...</div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Trending Memes</h1>
        <div className="text-sm text-gray-500 mt-2">
          Showing {memes.length} memes
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {memes.map((meme) => (
          <div
            key={meme.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden h-[500px] flex flex-col"
          >
            <div className="flex-1 min-h-0 flex items-center justify-center bg-gray-50">
              <img
                src={meme.imageUrl}
                alt="Meme"
                className="w-auto h-auto max-w-[90%] max-h-[90%] object-contain"
              />
            </div>
            <div className="p-4 w-full flex-shrink-0">
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <button
                    onClick={() => handleVote(meme.id, "up")}
                    className="flex items-center gap-2 text-gray-600 hover:text-green-500"
                  >
                    <FaThumbsUp />
                  </button>
                  <button
                    onClick={() => handleVote(meme.id, "down")}
                    className="flex items-center gap-2 text-gray-600 hover:text-red-500"
                  >
                    <FaThumbsDown />
                  </button>
                </div>
                <span className="text-lg font-semibold text-gray-700">
                  Votes: {meme.votes}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Created: {new Date(meme.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {nextPage && (
        <div
          ref={observerTarget}
          className="h-20 flex items-center justify-center"
        >
          {loadingMore ? (
            <div className="text-lg text-gray-600">Loading more memes...</div>
          ) : (
            <div className="text-lg text-gray-400">Scroll for more</div>
          )}
        </div>
      )}

      {!nextPage && memes.length > 0 && (
        <div className="text-center py-8 text-gray-600">
          No more memes to load
        </div>
      )}
    </div>
  );
}
