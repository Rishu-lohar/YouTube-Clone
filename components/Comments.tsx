"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type CommentsProps = {
  videoId: string;
};

type Comment = {
  id: string;
  username: string;
  text: string;
};

export default function Comments({ videoId }: CommentsProps) {
  // Saare comments ki list
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      username: "John Doe",
      text: "Great video! Really enjoyed watching this.",
    },
    {
      id: "2",
      username: "Jane Smith",
      text: "Thanks for sharing this amazing content!",
    },
  ]);

  // Textarea me user jo type kar raha hai
  const [newComment, setNewComment] = useState("");

  // New comment add karne ka function
  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      username: "Rishu",
      text: newComment,
    };

    setComments([comment, ...comments]);
    setNewComment("");
  };

  return (
    <div className="space-y-6">

      {/* Total Comments */}
      <h2 className="text-xl font-semibold">
        {comments.length} Comments
      </h2>

      {/* Add Comment Section */}
      <div className="flex gap-4">
        <Avatar className="w-10 h-10">
          <AvatarFallback>R</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="resize-none"
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setNewComment("")}
            >
              Cancel
            </Button>

            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              Comment
            </Button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="flex gap-4"
          >
            <Avatar className="w-10 h-10">
              <AvatarFallback>
                {comment.username[0]}
              </AvatarFallback>
            </Avatar>

            <div>
              <p className="font-medium text-sm">
                {comment.username}
              </p>

              <p className="text-sm">
                {comment.text}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}