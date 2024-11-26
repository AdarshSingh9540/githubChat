'use client'
import axios from 'axios';
import React, { useState } from 'react';

export default function InputBox() {
  const [username, setUserName] = useState('');
  const [repos, setRepos] = useState([]);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!username) {
      setError('Please enter a username');
      return;
    }

    try {
      setError('');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_GITHUB_URL}/${username}/repos`);
      setRepos(response.data);
    } catch (err) {
      console.error(err);
      setError('User not found or API error');
    }
  };

  return (
    <div className='flex flex-col items-center justify-center h-screen bg-gray-900 text-white'>
      <div className='flex'>
        <input
          className='py-2 px-4 rounded-md text-black outline-none'
          type='text'
          placeholder='Enter GitHub username'
          value={username}
          onChange={(e) => setUserName(e.target.value)}
        />
        <button
          className='bg-blue-600 rounded-md hover:bg-blue-800 px-4 py-2 ml-4'
          onClick={handleSearch}
        >
          Search
        </button>
      </div>

      {error && <p className='mt-4 text-red-500'>{error}</p>}

      <div className='mt-6 w-full max-w-2xl'>
  {repos.length > 0 && !error ? (
    <ul className='bg-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto'>
      {repos.map((repo, index) => (
        <li
          key={index}
          className='border-b border-gray-700 py-2 last:border-none'
        >
          <a
            href={repo.html_url}
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-400 hover:underline'
          >
            {repo.name}
          </a>
        </li>
      ))}
    </ul>
  ) : (
    !error &&
    username.trim() && (
      <p className='mt-4 text-gray-500'>No repositories to display</p>
    )
  )}
</div>

    </div>
  );
}
