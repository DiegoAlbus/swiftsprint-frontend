# SwiftSprint Frontend

A modern Jira-like kanban board application built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Authentication**: JWT-based login and registration
- **Project Management**: Create, view, and delete projects
- **Kanban Board**: Drag-and-drop task management
- **Task Management**: Create, assign, and organize tasks
- **User Management**: View all users in the system
- **Modern UI**: Clean, responsive design with Tailwind CSS

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Axios** - HTTP client with JWT interceptors
- **@dnd-kit** - Drag and drop functionality
- **React Context** - State management

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- SwiftSprint backend running on `http://localhost:8080`

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` file (already created):

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Features Overview

### Authentication

- Register new users
- Login with email/password
- JWT token stored in localStorage
- Auto-redirect on authentication
- Logout functionality

### Projects

- Create projects with name, key, and description
- View all your projects
- Delete projects
- Navigate to project boards

### Kanban Board

- Drag and drop tasks between columns
- Create custom columns
- Delete columns
- Real-time position updates

### Tasks

- Create tasks with title, description, priority, and assignee
- Assign tasks to users
- Set priority levels (Low, Medium, High, Urgent)
- Delete tasks
- Drag to reorder and move between columns

### Users

- View all registered users
- See user roles and join dates

## API Integration

The app connects to the SwiftSprint backend API:

- **Auth**: `/api/auth/login`, `/api/auth/register`
- **Users**: `/api/users`, `/api/users/me`
- **Projects**: `/api/projects`
- **Columns**: `/api/projects/{id}/columns`
- **Tasks**: `/api/projects/{id}/tasks`
- **Tags** `/api/projects/{id}/tags`

All authenticated requests include JWT token in Authorization header.

## Development

### Running in Development

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Usage

1. **Register/Login**: Create an account or sign in
2. **Create Project**: Click "New Project" and fill in details
3. **Open Board**: Click "Open Board" on any project
4. **Add Columns**: Click "+ Add Column" to create custom columns
5. **Create Tasks**: Click "+ Add Task" in any column
6. **Drag Tasks**: Click and drag tasks to reorder or move between columns
7. **Assign Tasks**: Select assignee when creating tasks
8. **Delete Items**: Click the ✕ button on projects, columns, or tasks
9. **Add Tags**: Click "+ Add Tag" in any task to add tags
10. **Remove Tags**: Click the ✕ button to remove tags

## Notes

- Make sure the backend is running before starting the frontend
- Default backend URL is `http://localhost:8080/api`
- JWT tokens expire after 24 hours (configurable in backend)
- All data is persisted in PostgreSQL via the backend

## Future Enhancements (WIP)

- Search and filters
- Dark mode
- Mobile optimization
