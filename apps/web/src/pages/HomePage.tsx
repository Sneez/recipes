import { Link } from 'react-router-dom';

import { useUser } from '@clerk/clerk-react';
import { ArrowRight, FileText, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';

export function HomePage() {
  const { user } = useUser();
  const { data } = apiClient.users.getMe.useQuery(['me']);
  const profile = data?.status === 200 ? data.body : null;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here's what's happening in your workspace.
        </p>
      </div>

      {/* Quick-action cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <FileText className="h-4 w-4" />
              </div>
              <CardTitle className="text-base">Posts</CardTitle>
            </div>
            <CardDescription>
              Read and create posts shared with the community.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm">
              <Link to="/posts">
                Browse posts <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                <User className="h-4 w-4" />
              </div>
              <CardTitle className="text-base">Your Profile</CardTitle>
            </div>
            <CardDescription>
              Signed in as{' '}
              <span className="font-medium text-foreground">
                {profile?.email ?? '…'}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Manage your account settings via the avatar menu in the top-right
              corner.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
