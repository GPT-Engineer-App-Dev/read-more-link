import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const fetchTopStories = async () => {
  const response = await fetch(
    "https://hacker-news.firebaseio.com/v0/topstories.json"
  );
  if (!response.ok) {
    throw new Error("Failed to fetch top stories");
  }
  const storyIds = await response.json();
  const top100Ids = storyIds.slice(0, 100);
  const storyPromises = top100Ids.map(async (id) => {
    const storyResponse = await fetch(
      `https://hacker-news.firebaseio.com/v0/item/${id}.json`
    );
    if (!storyResponse.ok) {
      throw new Error("Failed to fetch story details");
    }
    return storyResponse.json();
  });
  return Promise.all(storyPromises);
};

const HackerNewsTopStories = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data, error, isLoading } = useQuery({
    queryKey: ["topStories"],
    queryFn: fetchTopStories,
  });

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch top stories");
    }
  }, [error]);

  const filteredStories = data?.filter((story) =>
    story.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <Input
        placeholder="Search stories..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4"
      />
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredStories?.map((story) => (
            <Card key={story.id}>
              <CardHeader>
                <CardTitle>{story.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Upvotes: {story.score}</p>
                <a
                  href={story.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Read more
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default HackerNewsTopStories;