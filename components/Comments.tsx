"use client";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

import{
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";

import{
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

import {ThumbsUp, ThumbsDown} from "lucide-react";

interface Comment {
  _id: string;
  videoid: string;
  userid: string;
  commentbody: string;
  usercommented: string;
  commentedon: string;

  likes:string[];
  dislikes:string[];

  reported: {
    user: string;
    reason: string;
    reportedAt: string;
  }[];

  status: string;
}

const Comments = ({ videoId }: any) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [reportOpen,setReportOpen] = useState(false);
  const [ selectedCommentId, setSelectedCommentId] = useState("");
  const [ reportReason, setReportReason] = useState("");

  useEffect(() => {
    loadComments();
  }, [videoId]);

  const loadComments = async () => {
    try {
      const res = await axiosInstance.get(`/comment/${videoId}`);
      setComments(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading comments...</div>;
  }

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await axiosInstance.post("/comment/postcomment", {
        videoid: videoId,
        userid: user._id,
        commentbody: newComment,
        usercommented: user.name,
      });

      if (res.data.comment) {
        const newCommentObj: Comment = {
          _id: Date.now().toString(),
          videoid: videoId,
          userid: user._id,
          commentbody: newComment,
          usercommented: user.name || "Anonymous",
          commentedon: new Date().toISOString(),
          likes:[],
          dislikes:[],
          reported:[],
          status:"active",
        };

        setComments([newCommentObj, ...comments]);
      }
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.commentbody);
  };

  const handleUpdateComment = async () => {
    if (!editText.trim() || !editingCommentId) return;
    try {
      const res = await axiosInstance.post(
        `/comment/editcomment/${editingCommentId}`,
        { commentbody: editText }
      );

      if (res.data) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === editingCommentId ? { ...c, commentbody: editText } : c
          )
        );
        setEditingCommentId(null);
        setEditText("");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await axiosInstance.delete(`/comment/deletecomment/${id}`);
      if (res.data.comment) {
        setComments((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLike = async(id:string)=>{
    if (!user) return;

    try{
      const res = await axiosInstance.put(`/comment/like/${id}`,{
        userid: user._id,
      });

      if(res.data.success){
        loadComments();
      }
    }
    catch(error){
      console.error(error);
    }
  };

  const handleDisLike = async(id:string)=>{
    if (!user) return;

    try{
      const res = await axiosInstance.put(`/comment/dislike/${id}`,{
        userid: user._id,
      });

      if(res.data.success){
        loadComments();
      }
    }
    catch(error){
      console.error(error);
    }
  };

  const openReportDialog = (id: string) => {
  setSelectedCommentId(id);
  setReportReason("");
  setReportOpen(true);
  };

  const handleReport = async () => {
  if (!user || !selectedCommentId || !reportReason) return;

  try {
    const res = await axiosInstance.put(
      `/comment/report/${selectedCommentId}`,
      {
        userid: user._id,
        reason: reportReason,
      }
    );

    if (res.data.success) {
      alert("Comment Reported Successfully");

      setReportOpen(false);
      setReportReason("");

      loadComments();
    }
  } catch (error) {
    console.error(error);
  }
};

  return (
    <>
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">{comments.length} Comments</h2>

        {user && (
          <div className="flex gap-4">
            <Avatar className="w-10 h-10">
              {user.image ? (
                <AvatarImage src={user.image} />
              ) : (
                <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e: any) => setNewComment(e.target.value)}
                className="min-h-[80px] resize-none border-0 border-b-2 rounded-none focus-visible:ring-0"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  onClick={() => setNewComment("")}
                  disabled={!newComment.trim()}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                >
                  Comment
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="flex gap-4">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>{comment.usercommented[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {comment.usercommented}
                    </span>
                    <span className="text-xs text-gray-600">
                      {formatDistanceToNow(new Date(comment.commentedon))} ago
                    </span>
                  </div>

                  {editingCommentId === comment._id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editText}
                        onChange={(e: any) => setEditText(e.target.value)}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          onClick={handleUpdateComment}
                          disabled={!editText.trim()}
                        >
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditText("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm">{comment.commentbody}</p>

                      <div className="flex items-center gap-4 mt-2 text-gray-500">

                        <button
                          onClick={()=>handleLike(comment._id)}
                          className="flex items-center gap-1 hover:text-blue-500"
                        >
                          <ThumbsUp size={16}/>
                          {comment.likes.length}
                        </button> 

                        <button
                          onClick={()=>handleDisLike(comment._id)}
                          className="flex items-center gap-1 hover:text-red-500"
                        >
                          <ThumbsDown size={16}/>
                          {comment.dislikes.length}
                        </button>  

                        <button
                          onClick={() => openReportDialog(comment._id)}
                          className = "text-sm hover:text-red-500"
                        >
                          🚩 Report
                        </button>
                      </div>


                      {comment.userid === user?._id && (
                        <div className="flex gap-2 mt-2 text-sm text-gray-500">
                          <button onClick={() => handleEdit(comment)}>
                            Edit
                          </button>
                          <button onClick={() => handleDelete(comment._id)}>
                            Delete
                          </button>
                        </div>
                      )}

                      
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Comment</DialogTitle>
          </DialogHeader>

          {/* Select */}

          <Select
            value={reportReason}
            onValueChange={(value)=>{
              setReportReason(value as string);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a reason" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="Spam">Spam</SelectItem>

              <SelectItem value="Harassment">
                Harassment
              </SelectItem>

              <SelectItem value="Hate Speech">
                Hate Speech
              </SelectItem>

              <SelectItem value="Violence">
                Violence
              </SelectItem>

              <SelectItem value="False Information">
                False Information
              </SelectItem>

              <SelectItem value="Other">
                Other
              </SelectItem>
            </SelectContent>
          </Select>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReportOpen(false)}
            >
              Cancel
            </Button>

            <Button
              onClick={handleReport}
              disabled={!reportReason}
            >
              Report
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>
      
    </>
  );
};

export default Comments;
