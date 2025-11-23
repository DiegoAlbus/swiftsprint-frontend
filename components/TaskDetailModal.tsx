"use client";

import { formatComment } from "@/app/helpers/FormatHelper";
import {
  Column,
  columnAPI,
  Comment,
  commentAPI,
  ProjectMember,
  Tag,
  tagAPI,
  Task,
  taskAPI,
  User,
  userAPI,
} from "@/lib/api";
import { useEffect, useState } from "react";

interface Props {
  task: Task;
  onClose: () => void;
  onUpdate: () => void;
  userRole?: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER" | null;
  currentUser?: User | null;
  projectMembers?: ProjectMember[];
  projectOwnerId?: number;
}

export default function TaskDetailModal({
  task,
  onClose,
  onUpdate,
  userRole = null,
  currentUser = null,
  projectMembers = [],
  projectOwnerId,
}: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [users, setUsers] = useState<User[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3B82F6");
  const [showAddTag, setShowAddTag] = useState(false);
  const [loading, setLoading] = useState(false);

  const canEdit = userRole !== "VIEWER";

  const getUserRole = (userId: number): string => {
    if (projectOwnerId === userId) {
      return "OWNER";
    }
    const member = projectMembers.find((m) => m.user.id === userId);
    return member?.role || "MEMBER";
  };

  useEffect(() => {
    loadComments();
    loadUsers();
    loadColumns();
    loadTags();
  }, [task.id]);

  const loadComments = async () => {
    try {
      const response = await commentAPI.getByTask(task.id);
      setComments(response.data);
    } catch (err) {
      console.error("Failed to load comments", err);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await userAPI.getAllUsers();
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to load users", err);
    }
  };

  const loadColumns = async () => {
    try {
      const response = await columnAPI.getByProject(task.projectId);
      setColumns(response.data);
    } catch (err) {
      console.error("Failed to load columns", err);
    }
  };

  const loadTags = async () => {
    try {
      const response = await tagAPI.getByTask(task.id);
      setTags(response.data);
    } catch (err) {
      console.error("Failed to load tags", err);
    }
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    try {
      await tagAPI.create(task.id, { name: newTagName, color: newTagColor });
      setNewTagName("");
      setNewTagColor("#3B82F6");
      setShowAddTag(false);
      loadTags();
    } catch (err) {
      alert("Failed to add tag");
    }
  };

  const handleDeleteTag = async (tagId: number) => {
    if (!confirm("Delete this tag?")) return;
    try {
      await tagAPI.delete(task.id, tagId);
      loadTags();
    } catch (err) {
      alert("Failed to delete tag");
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await commentAPI.create(task.id, { content: newComment });
      setNewComment("");
      loadComments();
    } catch (err) {
      alert("Failed to add comment");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await commentAPI.delete(task.id, commentId);
      loadComments();
    } catch (err) {
      alert("Failed to delete comment");
    }
  };

  const handleSaveTask = async () => {
    setLoading(true);
    try {
      await taskAPI.update(task.projectId, task.id, {
        title: editedTask.title,
        description: editedTask.description,
        columnId: editedTask.columnId,
        assigneeId: editedTask.assignee?.id,
        priority: editedTask.priority,
        position: editedTask.position,
      });
      setIsEditing(false);
      onUpdate();
      onClose();
    } catch (err) {
      alert("Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  const applyDescriptionFormatting = (
    format: "bold" | "italic" | "code" | "h1" | "h2"
  ) => {
    const textarea = document.getElementById(
      "description-edit-textarea"
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    let newText = "";
    switch (format) {
      case "bold":
        newText = `${before}**${selection}**${after}`;
        break;
      case "italic":
        newText = `${before}*${selection}*${after}`;
        break;
      case "code":
        newText = `${before}\`${selection}\`${after}`;
        break;
      case "h1":
        newText = `${before}# ${selection}${after}`;
        break;
      case "h2":
        newText = `${before}## ${selection}${after}`;
        break;
    }

    setEditedTask({ ...editedTask, description: newText });
    setTimeout(() => textarea.focus(), 0);
  };

  const priorityColors = {
    LOW: "bg-gray-200 text-gray-700",
    MEDIUM: "bg-green-200 text-green-700",
    HIGH: "bg-orange-200 text-orange-700",
    URGENT: "bg-red-200 text-red-700",
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">Task Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={editedTask.title}
                onChange={(e) =>
                  setEditedTask({ ...editedTask, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <div className="mb-2 flex gap-2 border-b border-gray-200 pb-2">
                <button
                  type="button"
                  onClick={() => applyDescriptionFormatting("bold")}
                  className="px-2 py-1 text-sm font-bold border border-gray-300 rounded hover:bg-gray-100"
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => applyDescriptionFormatting("italic")}
                  className="px-2 py-1 text-sm italic border border-gray-300 rounded hover:bg-gray-100"
                  title="Italic"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => applyDescriptionFormatting("code")}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                  title="Code"
                >
                  {"</>"}
                </button>
                <button
                  type="button"
                  onClick={() => applyDescriptionFormatting("h1")}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                  title="Heading 1"
                >
                  H1
                </button>
                <button
                  type="button"
                  onClick={() => applyDescriptionFormatting("h2")}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                  title="Heading 2"
                >
                  H2
                </button>
                <span className="text-xs text-gray-500 self-center ml-2">
                  Supports **bold**, *italic*, `code`, # H1, ## H2
                </span>
              </div>
              <textarea
                id="description-edit-textarea"
                value={editedTask.description || ""}
                onChange={(e) =>
                  setEditedTask({ ...editedTask, description: e.target.value })
                }
                placeholder="Add description... (supports **bold**, *italic*, `code`, # H1, ## H2)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={editedTask.priority}
                  onChange={(e) =>
                    setEditedTask({
                      ...editedTask,
                      priority: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Column
                </label>
                <select
                  value={editedTask.columnId}
                  onChange={(e) =>
                    setEditedTask({
                      ...editedTask,
                      columnId: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {columns.map((column) => (
                    <option key={column.id} value={column.id}>
                      {column.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assignee
              </label>
              <select
                value={editedTask.assignee?.id || ""}
                onChange={(e) => {
                  const userId = e.target.value
                    ? parseInt(e.target.value)
                    : undefined;
                  const user = users.find((u) => u.id === userId);
                  setEditedTask({ ...editedTask, assignee: user });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {`${user?.name} (${user?.userIdentifier})`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tags
                </label>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setShowAddTag(true)}
                    className="text-sm text-green-600 hover:text-green-800"
                  >
                    + Add Tag
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: tag.color }}
                  >
                    <span>{tag.name}</span>
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => handleDeleteTag(tag.id)}
                        className="hover:bg-black/20 rounded-full p-0.5 transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                {tags.length === 0 && (
                  <span className="text-sm text-gray-500">No tags yet</span>
                )}
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleSaveTask}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => {
                  setEditedTask(task);
                  setIsEditing(false);
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{task.title}</h3>
                <div
                  className="text-gray-600 mb-4"
                  dangerouslySetInnerHTML={{
                    __html: task.description
                      ? formatComment(task.description)
                      : "No description",
                  }}
                />
                <div className="flex items-center space-x-4 mb-3">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      priorityColors[task.priority]
                    }`}
                  >
                    {task.priority}
                  </span>
                  <span className="text-sm text-gray-500">
                    Column: {task.columnName}
                  </span>
                  {task.assignee && (
                    <span className="text-sm text-gray-500">
                      Assigned to:{" "}
                      {`${task.assignee?.name} (${task.assignee?.userIdentifier})`}
                    </span>
                  )}
                </div>
                {task.tags && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-3 py-1 rounded-full text-sm font-medium text-white"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {canEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        )}

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">
            Comments ({comments.length})
          </h3>
          <form onSubmit={handleAddComment} className="mb-4">
            <div className="mb-2 flex gap-2 border-b border-gray-200 pb-2">
              <button
                type="button"
                onClick={() => {
                  const textarea = document.getElementById(
                    "comment-textarea"
                  ) as HTMLTextAreaElement;
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const text = textarea.value;
                  const before = text.substring(0, start);
                  const selection = text.substring(start, end);
                  const after = text.substring(end);
                  setNewComment(`${before}**${selection}**${after}`);
                  setTimeout(() => textarea.focus(), 0);
                }}
                className="px-2 py-1 text-sm font-bold border border-gray-300 rounded hover:bg-gray-100"
                title="Bold"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => {
                  const textarea = document.getElementById(
                    "comment-textarea"
                  ) as HTMLTextAreaElement;
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const text = textarea.value;
                  const before = text.substring(0, start);
                  const selection = text.substring(start, end);
                  const after = text.substring(end);
                  setNewComment(`${before}*${selection}*${after}`);
                  setTimeout(() => textarea.focus(), 0);
                }}
                className="px-2 py-1 text-sm italic border border-gray-300 rounded hover:bg-gray-100"
                title="Italic"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => {
                  const textarea = document.getElementById(
                    "comment-textarea"
                  ) as HTMLTextAreaElement;
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const text = textarea.value;
                  const before = text.substring(0, start);
                  const selection = text.substring(start, end);
                  const after = text.substring(end);
                  setNewComment(`${before}\`${selection}\`${after}`);
                  setTimeout(() => textarea.focus(), 0);
                }}
                className="px-2 py-1 text-sm font-mono border border-gray-300 rounded hover:bg-gray-100"
                title="Code"
              >
                {"</>"}
              </button>
              <span className="text-xs text-gray-500 self-center ml-2">
                Supports **bold**, *italic*, `code`
              </span>
            </div>
            <textarea
              id="comment-textarea"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment... (supports **bold**, *italic*, `code`)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
              rows={3}
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
            >
              Add Comment
            </button>
          </form>
          <div className="space-y-3">
            {comments.map((comment) => {
              const commentAuthorRole = getUserRole(comment.author.id);
              const isOwnComment = currentUser?.id === comment.author.id;

              return (
                <div key={comment.id} className="bg-gray-50 p-3 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-semibold text-sm">
                        {comment.author.name}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({commentAuthorRole})
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {isOwnComment && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <div
                    className="text-sm text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: formatComment(comment.content),
                    }}
                  />
                </div>
              );
            })}
            {comments.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">
                No comments yet
              </p>
            )}
          </div>
        </div>
      </div>

      {showAddTag && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Add Tag</h3>
            <form onSubmit={handleAddTag} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tag Name
                </label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Bug, Feature"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md font-mono"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTag(false);
                    setNewTagName("");
                    setNewTagColor("#3B82F6");
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
