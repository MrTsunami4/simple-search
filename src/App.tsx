import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { useState } from "react";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SearchPage />
    </QueryClientProvider>
  );
}

export type SearchResult = {
  results: Array<{
    content: string;
    content_type: "text" | "image";
    id: number;
    score: number;
  }>;
};

async function search(query: string) {
  if (!query) {
    return null;
  }
  const response = await fetch("http://146.190.128.60:8081/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: query }),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch search results");
  }
  const { results } = (await response.json()) as SearchResult;
  const sortedResults = results.sort((a, b) => b.score - a.score);
  return sortedResults;
}

function prepareQuery(query: string) {
  // TODO: Implement query preprocessing, pleace do le kasask magic there
  // :D :D :D :D, :thumbsup:
  return query.trim();
}

function SearchPage() {
  const [query, setQuery] = useState("");
  const { isPending, isError, data, error } = useQuery({
    queryKey: ["search"],
    queryFn: () => search(query),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-blue-200 flex-col">
      <div className="w-full max-w-3xl px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-800">
          Semantic Search Engine
        </h1>
        <div className="flex gap-2">
          <Input
            type="search"
            placeholder="Enter your search query..."
            className="flex-grow text-lg py-6 px-4 rounded-full bg-white shadow-lg focus:ring-2 focus:ring-blue-500"
            name="q"
            value={query}
            onInput={(e) =>
              setQuery(prepareQuery((e.target as HTMLInputElement).value))
            }
          />
          <Button
            type="submit"
            className="px-8 py-6 text-lg rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            onClick={() => queryClient.invalidateQueries()}
          >
            Search
          </Button>
        </div>
      </div>
      {isPending && <p className="text-2xl text-blue-800">Loading...</p>}
      {isError && (
        <p className="text-2xl text-red-800">
          Failed to load search results: {error.message}
        </p>
      )}
      {data && (
        <ul className="w-full max-w-3xl px-4 mt-8">
          {data.map((result) => (
            <li
              key={result.id}
              className="p-4 my-4 bg-white rounded-lg shadow-lg"
            >
              <h2 className="text-2xl font-bold text-blue-800">
                {result.content_type === "image" ? (
                  <img
                    src={`data:image/png;base64,${result.content}`}
                    alt="Search result image"
                    className="w-full h-auto"
                  />
                ) : (
                  <p>{result.content}</p>
                )}
              </h2>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
