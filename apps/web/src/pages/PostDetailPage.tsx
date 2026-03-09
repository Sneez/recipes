import { useParams, useNavigate, Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiClient } from "@/lib/api-client";

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();

  const { data, isLoading } = apiClient.posts.getById.useQuery(
    ["posts", id],
    { params: { id: id! } },
    { enabled: !!id },
  );

  const deleteMutation = apiClient.posts.delete.useMutation();

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (data?.status !== 200) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/posts">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to posts
          </Link>
        </Button>
        <p className="text-muted-foreground">Post not found.</p>
      </div>
    );
  }

  const post = data.body;
  const isAuthor = user?.id === post.authorId;

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this post?")) return;
    await deleteMutation.mutateAsync({ params: { id: post.id } });
    navigate("/posts");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Back */}
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/posts">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to posts
        </Link>
      </Button>

      {/* Article */}
      <article className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
            {isAuthor && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-normal">
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </Badge>
            {isAuthor && (
              <Badge variant="outline" className="font-normal">
                Your post
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        <div className="prose prose-neutral max-w-none">
          {post.content.split("\n").map((para, i) =>
            para ? (
              <p key={i} className="leading-7 [&:not(:first-child)]:mt-4">
                {para}
              </p>
            ) : null,
          )}
        </div>
      </article>
    </div>
  );
}
