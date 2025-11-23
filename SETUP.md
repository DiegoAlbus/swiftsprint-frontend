# SwiftSprint Frontend - Quick Setup Guide

## Prerequisites
- Node.js 18 or higher
- SwiftSprint backend running on `http://localhost:8080`

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

This will install:
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Axios (HTTP client)
- @dnd-kit (drag and drop)

### 2. Environment Setup
The `.env.local` file is already configured:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

If your backend runs on a different port, update this file.

### 3. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## First Time Usage

### 1. Register an Account
- Navigate to `http://localhost:3000`
- You'll be redirected to `/login`
- Click "Don't have an account? Register"
- Fill in your name, email, and password
- Click "Register"

### 2. Create Your First Project
- After registration, you'll be redirected to `/projects`
- Click "+ New Project"
- Enter:
  - **Project Name**: e.g., "My First Project"
  - **Project Key**: e.g., "MFP" (2-10 uppercase letters/numbers)
  - **Description**: Optional description
- Click "Create"

### 3. Open the Kanban Board
- Click "Open Board" on your project
- You'll see 3 default columns:
  - To Do
  - In Progress
  - Done

### 4. Create Tasks
- Click "+ Add Task" in any column
- Fill in:
  - **Title**: Task name
  - **Description**: Optional details
  - **Priority**: Low, Medium, High, or Urgent
  - **Assignee**: Select a user or leave unassigned
- Click "Create"

### 5. Drag and Drop
- Click and hold any task card
- Drag it to a different column or position
- Release to drop
- The task position is automatically saved

### 6. Manage Columns
- Click "+ Add Column" to create custom columns
- Click the ✕ button on a column to delete it (this deletes all tasks in that column)

### 7. View Users
- Click "Users" in the navigation bar
- See all registered users, their roles, and join dates

## Features

### Authentication
- ✅ JWT-based authentication
- ✅ Auto-redirect to login if not authenticated
- ✅ Token stored in localStorage
- ✅ Auto-logout on token expiration

### Projects
- ✅ Create projects with unique keys
- ✅ View all your projects
- ✅ Delete projects
- ✅ Navigate to project boards

### Kanban Board
- ✅ Drag and drop tasks
- ✅ Create custom columns
- ✅ Delete columns
- ✅ Visual priority indicators
- ✅ Task assignment display

### Tasks
- ✅ Create tasks with all details
- ✅ Assign to users
- ✅ Set priority levels
- ✅ Delete tasks
- ✅ Drag to reorder

### Users
- ✅ View all users
- ✅ See user roles
- ✅ See join dates

## Troubleshooting

### "Failed to fetch" or Network Errors
**Problem**: Cannot connect to backend
**Solution**: 
- Ensure backend is running on `http://localhost:8080`
- Check `.env.local` has correct API URL
- Restart the dev server after changing `.env.local`

### "Unauthorized" or Auto-logout
**Problem**: JWT token expired or invalid
**Solution**:
- Login again
- Tokens expire after 24 hours (configurable in backend)

### Drag and Drop Not Working
**Problem**: Tasks don't move when dragged
**Solution**:
- Make sure you're clicking and holding on the task card
- Try refreshing the page
- Check browser console for errors

### Styles Not Loading
**Problem**: Page looks unstyled
**Solution**:
- Run `npm install` again
- Delete `.next` folder and restart dev server
- Check Tailwind CSS is properly configured

### Port 3000 Already in Use
**Problem**: Cannot start dev server
**Solution**:
```bash
# Use a different port
npm run dev -- -p 3001
```

## Development Tips

### Hot Reload
- Changes to files automatically reload the page
- No need to restart the server for most changes

### Browser DevTools
- Open browser console (F12) to see API requests
- Check Network tab for API calls
- Check Console tab for errors

### Testing API Calls
- All API calls are in `lib/api.ts`
- Check browser Network tab to see requests/responses
- JWT token is automatically added to all authenticated requests

### Debugging Authentication
- Check localStorage for `token` and `user` keys
- Clear localStorage to force logout: `localStorage.clear()`

## Project Structure

```
app/
├── layout.tsx              # Root layout with AuthProvider
├── page.tsx                # Home (redirects to login or projects)
├── login/page.tsx          # Login page
├── register/page.tsx       # Register page
├── projects/
│   ├── page.tsx           # Projects list
│   └── [id]/page.tsx      # Project board
└── users/page.tsx         # Users list

components/
├── Navbar.tsx             # Navigation bar
├── KanbanBoard.tsx        # Main board with drag & drop
├── KanbanColumn.tsx       # Column with tasks
├── TaskCard.tsx           # Task display
├── SortableTaskCard.tsx   # Draggable task wrapper
└── TaskModal.tsx          # Task creation form

contexts/
└── AuthContext.tsx        # Authentication state management

lib/
└── api.ts                 # Axios instance and API methods
```

## API Endpoints Used

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/users` - Get all users
- `GET /api/users/me` - Get current user
- `GET /api/projects` - Get user's projects
- `POST /api/projects` - Create project
- `DELETE /api/projects/{id}` - Delete project
- `GET /api/projects/{id}/columns` - Get project columns
- `POST /api/projects/{id}/columns` - Create column
- `DELETE /api/projects/{id}/columns/{columnId}` - Delete column
- `GET /api/projects/{id}/tasks` - Get project tasks
- `POST /api/projects/{id}/tasks` - Create task
- `PATCH /api/projects/{id}/tasks/{taskId}/move` - Move task
- `DELETE /api/projects/{id}/tasks/{taskId}` - Delete task

## Building for Production

```bash
# Build the app
npm run build

# Start production server
npm start
```

## Next Steps

1. Start the backend: `cd swiftsprint && ./mvnw spring-boot:run`
2. Start the frontend: `cd swiftsprint-app && npm run dev`
3. Open `http://localhost:3000`
4. Register and start creating projects!

## Support

For issues:
- Check browser console for errors
- Check backend logs
- Verify database is running
- Ensure all dependencies are installed

Enjoy using SwiftSprint! 🚀

