"use client";

import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import {
  Column,
  columnAPI,
  Project,
  projectAPI,
  ProjectMember,
  projectMemberAPI,
  User,
  userAPI,
} from "@/lib/api";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProjectSettingsPage() {
  const params = useParams();
  const projectId = parseInt(params.id as string);
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState("MEMBER");
  const [newColumnName, setNewColumnName] = useState("");
  const [editingColumnId, setEditingColumnId] = useState<number | null>(null);
  const [editingColumnPosition, setEditingColumnPosition] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadData();
  }, [user, projectId, router]);

  const loadData = async () => {
    try {
      const [projectRes, membersRes, usersRes, columnsRes] = await Promise.all([
        projectAPI.getById(projectId),
        projectMemberAPI.getByProject(projectId),
        userAPI.getAllUsers(),
        columnAPI.getByProject(projectId),
      ]);
      setProject(projectRes.data);
      setMembers(membersRes.data);
      setUsers(usersRes.data);
      setColumns(columnsRes.data);

      if (projectRes.data.owner.id !== user?.id) {
        setError("Only project owners can access settings");
        setTimeout(() => router.push(`/projects/${projectId}`), 2000);
      }
    } catch (err: any) {
      console.error("Failed to load data", err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        setError("You don't have access to this project");
      } else if (err.response?.status === 404) {
        setError("Project not found");
      } else {
        setError(
          err.response?.data?.message || "Failed to load project settings"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    try {
      await projectMemberAPI.add(projectId, {
        userId: selectedUserId,
        role: selectedRole,
      });
      setShowAddModal(false);
      setSelectedUserId(null);
      setSelectedRole("MEMBER");
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to add member");
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!confirm("Remove this member from the project?")) return;
    try {
      await projectMemberAPI.remove(projectId, memberId);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to remove member");
    }
  };

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnName.trim()) return;
    try {
      await columnAPI.create(projectId, {
        name: newColumnName,
        position: columns.length,
      });
      setShowAddColumnModal(false);
      setNewColumnName("");
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to add column");
    }
  };

  const handleDeleteColumn = async (columnId: number) => {
    if (!confirm("Delete this column? This action cannot be undone.")) return;
    try {
      await columnAPI.delete(projectId, columnId);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete column");
    }
  };

  const handleUpdateColumnPosition = async (
    columnId: number,
    columnName: string
  ) => {
    try {
      await columnAPI.update(projectId, columnId, {
        name: columnName,
        position: editingColumnPosition,
      });
      setEditingColumnId(null);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update column position");
    }
  };

  const handleUpdateMemberRole = async (
    memberId: number,
    userId: number,
    newRole: string
  ) => {
    try {
      await projectMemberAPI.update(projectId, memberId, {
        userId: userId,
        role: newRole,
      });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update member role");
    }
  };

  const availableUsers = users.filter(
    (u) =>
      !members.some((m) => m.user.id === u.id) && u.id !== project?.owner.id
  );

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <div className="text-xl text-red-600">
            {error || "Project not found"}
          </div>
          <Link
            href="/projects"
            className="text-green-600 hover:text-green-800"
          >
            ← Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href={`/projects/${projectId}`}
            className="text-green-600 hover:text-green-800 mb-2 inline-block"
          >
            ← Back to Board
          </Link>
          <h1 className="text-3xl font-bold">Project Settings</h1>
          <p className="text-gray-600">{project.name}</p>
        </div>

        {/* Columns Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Board Columns</h2>
            <button
              onClick={() => setShowAddColumnModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              + Add Column
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {columns.map((column) => (
                  <tr key={column.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {column.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingColumnId === column.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editingColumnPosition}
                            onChange={(e) =>
                              setEditingColumnPosition(parseInt(e.target.value))
                            }
                            className="w-20 px-2 py-1 border border-gray-300 rounded"
                            min="0"
                          />
                          <button
                            onClick={() =>
                              handleUpdateColumnPosition(column.id, column.name)
                            }
                            className="text-green-600 hover:text-green-900"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingColumnId(null)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{column.position}</span>
                          <button
                            onClick={() => {
                              setEditingColumnId(column.id);
                              setEditingColumnPosition(column.position);
                            }}
                            className="text-green-600 hover:text-green-900 text-xs"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteColumn(column.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Members Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Project Members</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              + Add Member
            </button>
          </div>

          <div className="space-y-3">
            {/* Owner */}
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
              <div>
                <div className="font-semibold">
                  {project.owner.name} ({project.owner.userIdentifier})
                </div>
                <div className="text-sm text-gray-600">
                  {project.owner.email}
                </div>
              </div>
              <span className="px-3 py-1 bg-purple-200 text-purple-800 rounded text-sm font-semibold">
                OWNER
              </span>
            </div>

            {/* Members */}
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <div>
                  <div className="font-semibold">
                    {member.user.name} ({member.user.userIdentifier})
                  </div>
                  <div className="text-sm text-gray-600">
                    {member.user.email}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <select
                    value={member.role}
                    onChange={(e) =>
                      handleUpdateMemberRole(
                        member.id,
                        member.user.id,
                        e.target.value
                      )
                    }
                    className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-semibold border border-green-300"
                  >
                    <option value="VIEWER">Viewer</option>
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {members.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No members added yet
              </p>
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Add Member</h2>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User
                </label>
                <select
                  value={selectedUserId || ""}
                  onChange={(e) => setSelectedUserId(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select a user</option>
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.userIdentifier})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="VIEWER">Viewer</option>
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
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
                    setShowAddModal(false);
                    setSelectedUserId(null);
                    setSelectedRole("MEMBER");
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

      {showAddColumnModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Add Column</h2>
            <form onSubmit={handleAddColumn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Column Name
                </label>
                <input
                  type="text"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., In Review, Testing"
                  required
                />
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
                    setShowAddColumnModal(false);
                    setNewColumnName("");
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
