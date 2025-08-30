# Proddit

This is a productivity-focused Reddit-style website. Users can join communities, post, comment, chat, track tasks, build habits, and collaborate in study rooms.

## Tech Stack
- Backend: Node.js, Express, MongoDB, Socket.IO  
- Frontend: React, TailwindCSS, Axios  
- Authentication: JWT  
- Containerization: Docker
- Deployment: Render
- Development tools: Git, Thunderclient
- Package manager: npm

## Features
- User authentication (signup, login, JWT-based sessions)  
- Create and join communities (public and private/invite-only)  
- Create posts inside communities  
- Commenting on posts  
- Voting system (upvotes and downvotes combined into a single karma count for posts and users)  
- One-on-one and group chat using Socket.IO  
- A chats page to see all ongoing conversations  
- Study rooms with active timers showing how long each user has been online  
- Task tracker with filters and status (pending, in-progress, done)  
- Habit tracker with streaks and a calendar-style progress view  

## Setup

1. Clone the repo  
   ```bash
   git clone <repo-link>
   cd <project-folder>
   ```

2. Install frontend dependencies
   ```bash
   cd frontend 
   npm install
   ```

3. Install frontend dependencies
   ```bash
   cd backend
   npm install
   ```

3. Add a `.env` file in the root with the following:  
   ```
   PORT=5000
   MONGO_URI=mongodb-uri
   JWT_SECRET=your-secret
   ```

4. Run the backend  
   ```bash
   cd backend
   npm run dev
   ```

5. Run the frontend  
   ```bash
   cd frontend
   npm run dev
   ```

## Project Structure
```
/backend
   /config
   /models
   /routes
   /controllers
   server.js
/frontend
   /src
      /components
      /pages
```
