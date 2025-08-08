"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { Folder, ArrowLeft, GitBranch, Star, Eye } from "lucide-react";
import ChatWithRepo from "../chat/ChatWithRepo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "../ui/separator";

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
  const [viewingFile, setViewingFile] = useState(false);
  const [loading, setLoading] = useState(true);

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
          setLoading(true);
          const response = await axios.get(
            `https://api.github.com/repos/${owner}/${repoName}/contents/${path}`
          );
          setRepoContents(response.data);
          setCurrentPath(path);
          setFileContent("");
          setViewingFile(false);
        } catch (err) {
          console.error(err);
          setError("Failed to fetch repository contents");
        } finally {
          setLoading(false);
        }
      }
    },
    [owner, repoName]
  );

  const fetchFileContent = async (filePath: string) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://raw.githubusercontent.com/${owner}/${repoName}/main/${filePath}`
      );
      setFileContent(response.data);
      setViewingFile(true);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch file content");
    } finally {
      setLoading(false);
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
    setViewingFile(false);
    setFileContent("");
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    const iconMap: { [key: string]: string } = {
      js: "🟨",
      ts: "🔷",
      jsx: "⚛️",
      tsx: "⚛️",
      py: "🐍",
      java: "☕",
      cpp: "⚙️",
      c: "⚙️",
      html: "🌐",
      css: "🎨",
      json: "📋",
      md: "📝",
      txt: "📄",
      yml: "⚙️",
      yaml: "⚙️",
    };
    return iconMap[extension || ""] || "📄";
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">
            Loading repository...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center text-red-500">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-lg font-semibold mb-2">Error</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {error}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-s\ bg-gray-900  text-white ">
      {/* Header Section */}
      <div className=" dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-700 dark:border-slate-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <GitBranch className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-boldtext-white">
                  {owner}/{repoName}
                </h1>
              </div>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                <Star className="h-3 w-3 mr-1" />
                Repository
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              {currentPath && !viewingFile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBackClick}
                  className="flex items-center space-x-1 bg-transparent"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
              )}
              {viewingFile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBackToRepoClick}
                  className="flex items-center space-x-1 bg-transparent"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back to Repository</span>
                </Button>
              )}
            </div>
          </div>

          {/* Breadcrumb */}
          {currentPath && (
            <div className="mt-2 flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-400">
              <span>📁</span>
              <span>/</span>
              {currentPath.split("/").map((segment, index, array) => (
                <React.Fragment key={index}>
                  <span className="hover:text-blue-600 cursor-pointer">
                    {segment}
                  </span>
                  {index < array.length - 1 && <span>/</span>}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Repository Explorer */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>
                  {viewingFile ? "File Content" : "Repository Contents"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[480px]">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : !viewingFile ? (
                  <div className="space-y-2">
                    {repoContents.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-3 rounded-lg border border-gray-600 dark:border-slate-700  dark:hover:bg-slate-800 cursor-pointer transition-colors bg-gray-800 shadow-md  gap-4  hover:bg-gray-700"
                        onClick={() =>
                          item.type === "dir"
                            ? handleFolderClick(item.path)
                            : handleFileClick(item.path)
                        }
                      >
                        <div className="text-xl">
                          {item.type === "dir" ? (
                            <Folder className="h-5 w-5 text-blue-500" />
                          ) : (
                            <span>{getFileIcon(item.name)}</span>
                          )}
                        </div>
                        <span className="flex-1 truncate text-slate-300">
                          {item.name}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-xs text-slate-300"
                        >
                          {item.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">
                        File Preview
                      </h3>
                      <Badge variant="secondary">
                        {fileContent.split("\n").length} lines
                      </Badge>
                    </div>
                    <Separator />
                    <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 overflow-hidden">
                      <pre className="text-sm text-slate-100 whitespace-pre-wrap overflow-x-auto">
                        <code>{fileContent}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Section */}
          <div className="h-fit">
            <ChatWithRepo
              allFiles={allFiles}
              owner={owner}
              repoName={repoName}
              fileContent={fileContent}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Repository() {
  return (
    <Suspense
      fallback={
        <div className="h-[580px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">
              Loading repository...
            </p>
          </div>
        </div>
      }
    >
      <RepositoryContent />
    </Suspense>
  );
}
