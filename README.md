# SwiftSprint Frontend

A modern Jira-like kanban board application built with Next.js, TypeScript, and Tailwind CSS.

## Images
<img width="716" height="630" alt="1" src="https://github.com/user-attachments/assets/b349e529-05ad-4b78-ae22-b53c86341c3e" />
<img width="604" height="688" alt="2" src="https://github.com/user-attachments/assets/cfba1688-6a8d-4faf-822b-9943f7dff6c2" />
<img width="1380" height="665" alt="3" src="https://github.com/user-attachments/assets/ef0489e9-f19b-4090-af5f-a64d0cca05a4" />
<img width="1266" height="930" alt="4" src="https://github.com/user-attachments/assets/d700dd9c-bd2a-47b6-90db-79f68b5c26aa" />
<img width="1285" height="494" alt="5" src="https://github.com/user-attachments/assets/18d018fe-f942-4417-a386-16ea434d5862" />
<img width="1299" height="502" alt="6" src="https://github.com/user-attachments/assets/1099b639-ab63-458b-bc68-fdd28af81a5e" />
<img width="1282" height="1018" alt="9" src="https://github.com/user-attachments/assets/b4fdb4f4-7571-4178-ace4-0a94074d54d6" />
<img width="1546" height="1080" alt="10" src="https://github.com/user-attachments/assets/e8e616e5-caeb-4305-8f42-1fad2a44ccad" />
<img width="1548" height="1226" alt="11" src="https://github.com/user-attachments/assets/163ece4d-39ed-4379-910a-7a7f9df610ec" />
<img width="1535" height="1079" alt="12" src="https://github.com/user-attachments/assets/78c2aba2-4270-4212-ae6a-9936b70fdf63" />
<img width="1313" height="382" alt="13" src="https://github.com/user-attachments/assets/de3d6e92-ec39-423a-bcbe-2e0b62d32b10" />
<img width="1311" height="784" alt="14" src="https://github.com/user-attachments/assets/29f10cfd-9f33-48a9-bb8e-d6524d010011" />


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
