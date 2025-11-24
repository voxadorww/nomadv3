# Nomad Setup Instructions

## Application Overview

Nomad is a professional development hub agency platform where users can request developers for their projects.

## Features

✅ **Authentication**
- Email/password login and signup
- Discord OAuth integration (requires setup - see below)
- Secure session management with Supabase Auth

✅ **User Dashboard**
- Submit project requests with:
  - Project name and description
  - Developer type selection
  - Budget and timeline
  - Payment method preference
- View all submitted projects and their status
- View assigned developer profiles
- Request a different developer if needed

✅ **Admin Panel**
- **Analytics Tab**: Real-time metrics including:
  - Total users and active users (online now)
  - Total projects and revenue tracking
  - Project statistics
- **Projects Tab**: Review, approve, reject, and assign developers to projects
- **Developers Tab**: Add and manage developers with portfolios, skills, and rates
- **Users Tab**: View all registered users

✅ **Additional Features**
- Dark mode toggle
- Responsive design for mobile and desktop
- Footer with contact information
- 20% commission tracking on approved projects

## Getting Started

### 1. Sign Up for an Account

Click "Sign Up" and create your account with email, username, and password.

### 2. Making Yourself an Admin

After signing up and logging in:

1. Open your browser's developer console (F12)
2. Find your user ID in the console logs
3. Call this endpoint to make yourself an admin:

```bash
curl -X POST https://{projectId}.supabase.co/functions/v1/make-server-ae8fa403/make-admin/{YOUR_USER_ID}
```

Replace `{projectId}` with your Supabase project ID and `{YOUR_USER_ID}` with your actual user ID.

### 3. Enabling Discord Login (Optional)

To enable Discord OAuth login, follow these steps:

1. Go to the [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to your project
3. Go to **Authentication** → **Providers**
4. Enable **Discord** provider
5. Follow the instructions at: https://supabase.com/docs/guides/auth/social-login/auth-discord
6. Add your Discord OAuth credentials to Supabase

**Note:** Discord login will show an error until you complete the setup in your Supabase dashboard.

## Default Developers

The system comes pre-loaded with 4 developers:
- **John Smith** - Roblox Developer ($75/hr)
- **Sarah Johnson** - Web Developer ($85/hr)
- **Mike Chen** - App Developer ($80/hr)
- **Emily Brown** - Full Stack Developer ($90/hr)

You can add more developers through the Admin Panel.

## User Workflow

1. **User signs up** and creates an account
2. **User submits** a project request with all required details
3. **Admin reviews** the request in the Admin Panel
4. **Admin approves** and assigns a developer
5. **User views** the assigned developer's profile
6. **User can request** a different developer if needed

## Admin Features

### Analytics Dashboard
- Monitor active users in real-time
- Track total revenue from 20% commission
- View project statistics and trends

### Developer Management
- Add new developers with complete profiles
- Include portfolio URLs, bio, skills, and hourly rates
- View detailed developer information

### Project Management
- Search and filter projects by status
- Approve or reject project requests
- Assign developers based on specialization
- Handle requests for developer changes

## Contact Information

- **Email**: contact@nomad.dev
- **Discord**: https://discord.gg/nomad
- **GitHub**: https://github.com/nomad
- **Twitter**: https://twitter.com/nomad

## Support

For any issues or questions, please check the application logs in the browser console or contact support through the channels listed above.
