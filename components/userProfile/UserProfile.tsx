'use client'

import { useAppContext } from '@/context';
import { Building2, FolderGit2, Link, Mail, MapPin, Rss, Twitter, UserCheck } from 'lucide-react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface UserDetail {
  name: string;
  login: string;
  bio: string;
  avatar_url: string;
  followers: number;
  following: number;
  public_repos: number;
  company: string;
  location: string;
  twitter_username: string;
  blog: string;
  email:string;
}

export default function UserProfile() {
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { repo } = useAppContext();
  const userProfile = repo.length > 0 ? repo[0].owner : null;
  const username = userProfile?.login;

  useEffect(() => {
    const fetchUserDetail = async () => {
      if (!username) return;
      try {
        setIsLoading(true);
        const response = await axios.get<UserDetail>(`${process.env.NEXT_PUBLIC_GITHUB_URL}/${username}`);
        setUserDetail(response.data);
      } catch (error) {
        console.error('Error fetching user detail:', error);
        setError('Failed to fetch user details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetail();
  }, [username]);

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (isLoading) {
    return <div className="text-center text-white">Loading...</div>;
  }

  return (
    <div className='bg-gray-900 text-white w-full  flex justify-center items-center py-6'>
      <div className='w-[800px] h-auto py-[2rem] border-4 border-gray-800 rounded-lg'>
        <div className='flex flex-col items-center justify-center py-4'>
          <Image
            src={userDetail?.avatar_url || '/placeholder.svg'}
            height={80}
            width={80}
            alt='profile-img'
            className="rounded-full"
          />
          <h2 className='text-3xl font-bold mt-2'>{userDetail?.name}</h2>
          <h4 className='text-md text-gray-400'>@{userDetail?.login}</h4>
          <h3 className='text-lg text-center mt-2'>{userDetail?.bio}</h3>
        </div>

        <div className='flex justify-around mt-4 text-white'>
          <div className='flex flex-col items-center justify-center'>
            <div className='flex items-center'>
              <UserCheck className='mr-2 text-blue-400' />
              <span>Followers</span>
            </div>
            <h1 className='text-xl font-semibold'>{userDetail?.followers}</h1>
          </div>
          <div className='flex flex-col items-center'>
            <div className='flex items-center'>
              <Rss className='mr-2 text-blue-400' />
              <span>Following</span>
            </div>
            <h1 className='text-xl font-semibold'>{userDetail?.following}</h1>
          </div>
          <div className='flex flex-col items-center'>
            <div className='flex items-center'>
              <FolderGit2 className='mr-2 text-blue-400' />
              <span>Repositories</span>
            </div>
            <h1 className='text-xl font-semibold'>{userDetail?.public_repos}</h1>
          </div>
        </div>

        <div className='text-white mt-6 px-8 space-y-2'>
          {userDetail?.company && (
            <div className='flex items-center'>
              <Building2 className='mr-2 text-blue-400' />
              <span>{userDetail.company}</span>
            </div>
          )}
          {userDetail?.location && (
            <div className='flex items-center'>
              <MapPin className='mr-2 text-blue-400' />
              <span>{userDetail.location}</span>
            </div>
          )}
          {userDetail?.twitter_username && (
            <div className='flex items-center'>
              <Twitter className='mr-2 text-blue-400' />
              <span>@{userDetail.twitter_username}</span>
            </div>
          )}
           {userDetail?.email && (
            <div className='flex items-center'>
              <Mail className='mr-2 text-blue-400' />
              <a href={userDetail.email} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {userDetail.email}
              </a>
            </div>
          )}
          {userDetail?.blog && (
            <div className='flex items-center'>
              <Link className='mr-2 text-blue-400' />
              <a href={userDetail.blog} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {userDetail.blog}
              </a>
            </div>
          )}
         
        </div>
      </div>
    </div>
  );
}

