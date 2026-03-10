import { Route, Routes } from 'react-router-dom';

import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react';

import { Layout } from '@/components/Layout';
import { HomePage } from '@/pages/HomePage';
import { PostDetailPage } from '@/pages/PostDetailPage';
import { PostsPage } from '@/pages/PostsPage';

export function App() {
  return (
    <Routes>
      <Route
        element={
          <>
            <SignedIn>
              <Layout />
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/posts" element={<PostsPage />} />
        <Route path="/posts/:id" element={<PostDetailPage />} />
      </Route>
    </Routes>
  );
}
