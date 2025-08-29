# Proddit Frontend

A modern React frontend for the Proddit social media application, built with Vite, Tailwind CSS, and React Router.

## 🚀 Features

- **User Authentication**: Login and registration with JWT tokens
- **Post Management**: View, create, and interact with posts
- **Voting System**: Upvote/downvote posts with real-time karma updates
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Modern UI**: Clean, Reddit-inspired interface
- **Real-time Updates**: Live karma and vote updates
- **Protected Routes**: Authentication-based access control

## 🛠️ Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Authentication**: JWT tokens

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx      # Navigation bar
│   └── Post.jsx        # Individual post component
├── pages/              # Page components
│   ├── Home.jsx        # Main feed page
│   ├── Login.jsx       # User login
│   ├── Register.jsx    # User registration
│   ├── Communities.jsx # Communities list
│   ├── CommunityDetail.jsx # Individual community
│   └── CreateCommunity.jsx # Create community form
├── context/            # React context providers
│   └── AuthContext.jsx # Authentication context
├── utils/              # Utility functions
│   └── axios.js        # Axios configuration
├── App.jsx             # Main app component
├── main.jsx            # App entry point
└── index.css           # Global styles and Tailwind
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on localhost:5000

### Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 API Integration

The frontend connects to the Proddit backend API running on `http://localhost:5000/api`.

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication

### Post Endpoints
- `GET /posts` - Fetch all posts with pagination
- `POST /posts` - Create new post (protected)
- `GET /posts/:id` - Get single post

### Voting Endpoints
- `POST /posts/:id/vote` - Vote on post (protected)
- `GET /posts/:id/vote` - Get user's vote (protected)

## 🎨 UI Components

### Custom Tailwind Classes

The app includes custom Tailwind classes for consistent styling:

- `.btn-primary` - Primary button (orange)
- `.btn-secondary` - Secondary button (blue)
- `.btn-outline` - Outline button
- `.card` - Card container
- `.input-field` - Form input styling

### Color Scheme

- **Primary**: Proddit Orange (`#FF4500`)
- **Secondary**: Proddit Blue (`#0079D3`)
- **Dark**: (`#1A1A1B`)
- **Light**: (`#F8F9FA`)

## 🔐 Authentication Flow

1. **Registration**: Users create accounts with username, email, and password
2. **Login**: Users authenticate with email and password
3. **JWT Storage**: Tokens are stored in localStorage
4. **Auto-attachment**: Axios automatically includes JWT in API requests
5. **Protected Routes**: Certain pages require authentication

## 📱 Responsive Design

The application is built with a mobile-first approach:

- **Mobile**: Single column layout, collapsible navigation
- **Tablet**: Optimized spacing and layout
- **Desktop**: Full navigation, enhanced spacing

## 🚨 Error Handling

- **Form Validation**: Client-side validation with helpful error messages
- **API Errors**: Graceful error handling with user-friendly messages
- **Network Issues**: Fallback UI for connection problems
- **Loading States**: Spinner indicators during async operations

## 🔮 Future Features

- **Post Creation**: Form to create new posts
- **Comments System**: Reply and discuss posts
- **User Profiles**: View and edit user information
- **Search Functionality**: Search posts and communities
- **Real-time Updates**: WebSocket integration for live updates
- **Image Uploads**: Support for image posts
- **Moderation Tools**: Community moderation features

## 🧪 Testing

To test the application:

1. **Start the backend server** (Node.js + Express + MongoDB)
2. **Start the frontend** (`npm run dev`)
3. **Register a new user** or **login with existing credentials**
4. **Navigate through the app** to test all features
5. **Test voting** on posts (requires authentication)

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

### Deploy to Netlify

1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**Backend Connection Error:**
- Ensure backend is running on localhost:5000
- Check CORS configuration in backend

**Authentication Issues:**
- Clear localStorage and try logging in again
- Check JWT token expiration

**Styling Issues:**
- Ensure Tailwind CSS is properly configured
- Check PostCSS configuration

**Build Errors:**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility

---

**Happy coding! 🚀**
