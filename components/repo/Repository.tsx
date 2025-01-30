"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { Folder, File, ArrowLeft } from "lucide-react";
import ChatWithRepo from "../chat/ChatWithRepo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface RepoContent {
  name: string;
  path: string;
  type: "file" | "dir";
  children?: RepoContent[];
}

const RepositoryContent = () => {
  const [repoContents, setRepoContents] = useState<RepoContent[]>([]);
  const [currentPath, setCurrentPath] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [error, setError] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [allFiles, setAllFiles] = useState<RepoContent[]>([]);
  const [viewingFile, setViewingFile] = useState(false); // New state to track file view

  const searchParams = useSearchParams();
  const repoName = searchParams.get("name");
  const owner = searchParams.get("owner");

  const fetchAllFiles = useCallback(
    async (path = "") => {
      if (owner && repoName) {
        try {
          const response = await axios.get(
            `https://api.github.com/repos/${owner}/${repoName}/contents/${path}`
          );
          const contents = response.data;

          const files = await Promise.all(
            contents.map(async (item: RepoContent) => {
              if (item.type === "dir") {
                const subFiles = await fetchAllFiles(item.path);
                return { ...item, children: subFiles };
              }
              return item;
            })
          );

          return files;
        } catch (err) {
          console.error(err);
          setError("Failed to fetch repository contents");
          return [];
        }
      }
      return [];
    },
    [owner, repoName]
  );

  const fetchRepoContents = useCallback(
    async (path = "") => {
      if (owner && repoName) {
        try {
          const response = await axios.get(
            `https://api.github.com/repos/${owner}/${repoName}/contents/${path}`
          );
          setRepoContents(response.data);
          setCurrentPath(path);
          setFileContent("");
          setViewingFile(false); // Return to folder view
        } catch (err) {
          console.error(err);
          setError("Failed to fetch repository contents");
        }
      }
    },
    [owner, repoName]
  );

  const fetchFileContent = async (filePath: string) => {
    try {
      const response = await axios.get(
        `https://raw.githubusercontent.com/${owner}/${repoName}/main/${filePath}`
      );
      setFileContent(response.data);
      setViewingFile(true); // Switch to file view
    } catch (err) {
      console.error(err);
      setError("Failed to fetch file content");
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (owner && repoName) {
      fetchRepoContents();
      fetchAllFiles().then((files) => setAllFiles(files));
    }
  }, [owner, repoName, fetchRepoContents, fetchAllFiles]);

  const handleFolderClick = (path: string) => {
    fetchRepoContents(path);
  };

  const handleFileClick = (filePath: string) => {
    fetchFileContent(filePath);
  };

  const handleBackClick = () => {
    const parentPath = currentPath.split("/").slice(0, -1).join("/");
    fetchRepoContents(parentPath);
  };

  const handleBackToRepoClick = () => {
    setViewingFile(false); // Return to folder view
    setFileContent("");
  };

  if (!isClient) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-white md:flex py-20">
      <div className="md:w-1/2 pr-4">
        <h1 className="text-xl font-bold  text-center py-2">{repoName} </h1>
        <p className="text-lg font-semibold mb-4 text-center text-gray-400">
          {viewingFile ? `Viewing file content` : `Contents of the repository:`}
        </p>

        {currentPath && !viewingFile && (
          <Button
            className="mb-4 px-2 py-2 bg-blue-600 rounded hover:bg-blue-700 text-white flex items-center justify-center"
            onClick={handleBackClick}
          >
            <ArrowLeft className="mr-1" /> Back
          </Button>
        )}

        {viewingFile && (
          <Button
            className="mb-4 px-2 py-2 bg-blue-600 rounded hover:bg-blue-700 text-white flex items-center justify-center"
            onClick={handleBackToRepoClick}
          >
            <ArrowLeft className="mr-1" /> Back to Repository
          </Button>
        )}

        <div className="h-[calc(100vh-250px)]">
          {!viewingFile ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {repoContents.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-800 rounded shadow-md flex items-center gap-4 cursor-pointer hover:bg-gray-700"
                  onClick={() =>
                    item.type === "dir"
                      ? handleFolderClick(item.path)
                      : handleFileClick(item.path)
                  }
                >
                  {item.type === "dir" ? (
                    <Folder className="h-6 w-6 text-yellow-500" />
                  ) : (
                    <File className="h-6 w-6 text-blue-500" />
                  )}
                  <span className="truncate">{item.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-gray-800 rounded">
              <h2 className="text-xl font-semibold text-blue-500 mb-4">
                File Content
              </h2>
              <ScrollArea className="h-[calc(100vh-300px)]">
                <pre className="text-sm text-gray-200 whitespace-pre-wrap">
                  {fileContent}
                </pre>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>

      <div className="md:w-1/2 lg:pl-4">
        <ChatWithRepo
          allFiles={allFiles}
          owner={owner}
          repoName={repoName}
          fileContent={fileContent}
        />
      </div>
    </div>
  );
};

export default function Repository() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RepositoryContent />
    </Suspense>
  );
}
