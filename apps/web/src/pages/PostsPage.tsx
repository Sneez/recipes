import { useState } from 'react';
import { Link } from 'react-router-dom';

import { ChevronLeft, ChevronRight, Loader2, Plus } from 'lucide-react';

import { CreatePostDialog } from '@/components/CreatePostDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { apiClient } from '@/lib/api-client';

export function PostsPage() {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const limit = 10;

  const { data, isLoading, isError, refetch } = apiClient.posts.list.useQuery(
    ['posts', page],
    { query: { page, limit } },
  );

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || data?.status !== 200) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Failed to load posts. Please try again.
      </div>
    );
  }

  const { items, totalPages, total } = data.body;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Posts</h1>
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? 'post' : 'posts'} total
          </p>
        </div>
        <Button onClick={() => setOpen(true)} size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          New post
        </Button>
      </div>

      <Separator />

      {/* List */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <p className="font-medium">No posts yet</p>
          <p className="text-sm text-muted-foreground">
            Be the first to write one.
          </p>
          <Button size="sm" className="mt-2" onClick={() => setOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Create post
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((post) => (
            <Link
              key={post.id}
              to={`/posts/${post.id}`}
              className="block group"
            >
              <Card className="transition-colors group-hover:bg-muted/40">
                <CardHeader className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-base group-hover:underline">
                      {post.title}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="shrink-0 text-xs font-normal"
                    >
                      {new Date(post.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {post.content}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <CreatePostDialog
        open={open}
        onOpenChange={setOpen}
        onSuccess={() => void refetch()}
      />
    </div>
  );
}
