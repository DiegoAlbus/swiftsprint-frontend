"use client";

import KanbanBoard from "@/components/KanbanBoard";
import Navbar from "@/components/Navbar";
import TaskModal from "@/components/TaskModal";
import { useAuth } from "@/contexts/AuthContext";
import {
  Column,
  columnAPI,
  Project,
  projectAPI,
  ProjectMember,
  projectMemberAPI,
  Task,
  taskAPI,
  User,
  userAPI,
} from "@/lib/api";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BoardPage() {
  const params = useParams();
  const projectId = parseInt(params.id as string);
  const [project, setProject] = useState<Project | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<
    "OWNER" | "ADMIN" | "MEMBER" | "VIEWER" | null
  >(null);
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
      const [projectRes, columnsRes, tasksRes, usersRes, membersRes] =
        await Promise.all([
          projectAPI.getById(projectId),
          columnAPI.getByProject(projectId),
          taskAPI.getByProject(projectId),
          userAPI.getAllUsers(),
          projectMemberAPI.getByProject(projectId),
        ]);
      setProject(projectRes.data);
      setColumns(columnsRes.data);
      setTasks(tasksRes.data);
      setUsers(usersRes.data);
      setMembers(membersRes.data);

      if (projectRes.data.owner.id === user?.id) {
        setUserRole("OWNER");
      } else {
        const currentMember = membersRes.data.find(
          (m: ProjectMember) => m.user.id === user?.id
        );
        setUserRole(currentMember?.role || null);
      }
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

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

  if (!project) {
    return (
      <div>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">Project not found</div>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === project.owner.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-gray-600">{project.description}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelectedColumnId(columns.length > 0 ? columns[0].id : null);
                setShowTaskModal(true);
              }}
              className={`${
                userRole === "VIEWER"
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white px-4 py-2 rounded`}
              disabled={userRole === "VIEWER"}
            >
              + Add Task
            </button>
            {isOwner && (
              <Link
                href={`/projects/${projectId}/settings`}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                ⚙️ Settings
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 pb-8 flex justify-center items-center">
        <KanbanBoard
          projectId={projectId}
          columns={columns}
          tasks={tasks}
          users={users}
          onUpdate={loadData}
          isOwner={isOwner}
          userRole={userRole}
          currentUser={user}
          projectMembers={members}
          projectOwnerId={project.owner.id}
        />
      </div>
      {showTaskModal && selectedColumnId && (
        <TaskModal
          projectId={projectId}
          columnId={selectedColumnId}
          columns={columns}
          users={users}
          onClose={() => setShowTaskModal(false)}
          onSuccess={() => {
            setShowTaskModal(false);
            loadData();
          }}
          onColumnChange={setSelectedColumnId}
        />
      )}
    </div>
  );
}
