'use client';

import React from 'react';
import { useAppContext } from '@/context';
import { Calendar, Code, ExternalLink, Star, GitFork } from 'lucide-react';
import UserProfile from '../userProfile/UserProfile';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';



type Repository = {
  id: number;
  name: string;
  description: string | null;
  private: boolean;
  language: string | null;
  updated_at: string;
  stargazers_count: number;
  forks_count: number;
  owner: {
    login: string;
  };
};


export default function Repos() {
  const router = useRouter();
  const { repo } = useAppContext();

  if (!repo || repo.length === 0) {
    return <div className="text-center text-white">No repositories found.</div>;
  }

  const handleViewRepo = (repository:Repository) => {
    router.push(`/repository?name=${repository.name}&owner=${repository.owner.login}`);
  };

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-white">
      <UserProfile />
      <h1 className="text-3xl font-bold text-center mb-8 mt-12">Repositories</h1>
      <ScrollArea className="h-[calc(100vh-100px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
          {repo.map((repository, index) => (
            <motion.div
              key={repository.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg text-blue-500 font-semibold truncate">{repository.name}</span>
                    <Badge variant="secondary" className="ml-2">
                      {repository.private ? 'Private' : 'Public'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400 mb-4 h-12 overflow-hidden">
                    {repository.description || 'No description available'}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-blue-400" />
                      <span>{repository.language || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-400" />
                      <span>{new Date(repository.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span>{repository.stargazers_count}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GitFork className="h-4 w-4 text-green-400" />
                      <span>{repository.forks_count}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    variant="secondary"
                    onClick={() => handleViewRepo(repository)}
                  >
                    <span>View Repository</span>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
