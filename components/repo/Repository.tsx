'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { Folder, File, ArrowLeft } from 'lucide-react';

interface RepoContent {
  name: string;
  path: string;
  type: 'file' | 'dir';
  [key: string]: string;
}

const RepositoryContent = () => {
  const [repoContents, setRepoContents] = useState<RepoContent[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false); // To track if it's the client side

  const searchParams = useSearchParams();
  const repoName = searchParams.get('name');
  const owner = searchParams.get('owner');

  
  const fetchRepoContents = useCallback(async (path = '') => {
    if (owner && repoName) {
      try {
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repoName}/contents/${path}`);
        setRepoContents(response.data);
        setCurrentPath(path);
        setFileContent('');
      } catch (err) {
        console.error(err);
        setError('Failed to fetch repository contents');
      }
    }
  }, [owner, repoName]);

 
  const fetchFileContent = async (filePath: string) => {
    try {
      const response = await axios.get(`https://raw.githubusercontent.com/${owner}/${repoName}/main/${filePath}`);
      setFileContent(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch file content');
    }
  };

  useEffect(() => {
    setIsClient(true); 
  }, []);


  useEffect(() => {
    if (owner && repoName) {
      fetchRepoContents(); 
    }
  }, [owner, repoName, fetchRepoContents]);


  const handleFolderClick = (path: string) => {
    fetchRepoContents(path);
  };

  const handleFileClick = (filePath: string) => {
    fetchFileContent(filePath);
  };
  const handleBackClick = () => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/');
    fetchRepoContents(parentPath);
  };

  if (!isClient) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!repoContents.length) {
    return <div className="text-center text-white">Loading...</div>;
  }

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-4 text-center py-6">{repoName}</h1>
      <p className="text-gray-400 mb-6">Contents of the repository:</p>

      {currentPath && (
        <button
          className="mb-4 px-2 py-2 bg-blue-600 rounded hover:bg-blue-700 text-white flex items-center justify-center"
          onClick={handleBackClick}
        >
          <ArrowLeft className='mr-1' /> Back
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {repoContents.map((item, index) => (
          <div
            key={index}
            className="p-4 bg-gray-800 rounded shadow-md flex items-center gap-4 cursor-pointer hover:bg-gray-700"
            onClick={() => item.type === 'dir' ? handleFolderClick(item.path) : handleFileClick(item.path)}
          >
            {item.type === 'dir' ? (
              <Folder className="h-6 w-6 text-yellow-500" />
            ) : (
              <File className="h-6 w-6 text-blue-500" />
            )}
            <span className="truncate">{item.name}</span>
          </div>
        ))}
      </div>

      {fileContent && (
        <div className="mt-8 p-4 bg-gray-800 rounded">
          <h2 className="text-xl font-semibold text-blue-500 mb-4">File Content</h2>
          <pre className="text-sm text-gray-200 whitespace-pre-wrap">{fileContent}</pre>
        </div>
      )}
    </div>
  );
}

export default function Repository() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RepositoryContent />
    </Suspense>
  );
}
