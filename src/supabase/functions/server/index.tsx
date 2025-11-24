import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Track active sessions
const activeSessions = new Map<string, { userId: string; lastSeen: number }>();

// Middleware to track active users
const trackActivity = async (accessToken: string, userId: string) => {
  activeSessions.set(userId, { userId, lastSeen: Date.now() });
  
  // Clean up old sessions (inactive for more than 5 minutes)
  for (const [key, value] of activeSessions.entries()) {
    if (Date.now() - value.lastSeen > 5 * 60 * 1000) {
      activeSessions.delete(key);
    }
  }
};

// Signup route
app.post('/make-server-ae8fa403/signup', async (c) => {
  try {
    const { email, username, password } = await c.req.json();

    if (!email || !username || !password) {
      return c.json({ error: 'Email, username, and password are required' }, 400);
    }

    // Check if username is already taken
    const existingUsers = await kv.getByPrefix('user:');
    const usernameTaken = existingUsers.some((user: any) => user.username === username);
    
    if (usernameTaken) {
      return c.json({ error: 'Username already taken' }, 400);
    }

    // Create user with Supabase Auth
    // Automatically confirm the user's email since an email server hasn't been configured.
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { username },
      email_confirm: true,
    });

    if (error) {
      console.log('Supabase auth error during signup:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store additional user data in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      username,
      isAdmin: false,
      createdAt: new Date().toISOString(),
    });

    return c.json({ 
      message: 'User created successfully',
      userId: data.user.id,
    }, 201);
  } catch (error) {
    console.log('Error during signup:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Get current user
app.get('/make-server-ae8fa403/user', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      console.log('Error getting user during user fetch:', error);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Track activity
    await trackActivity(accessToken, user.id);

    // Get user data from KV store
    const userData = await kv.get(`user:${user.id}`);

    if (!userData) {
      return c.json({ error: 'User data not found' }, 404);
    }

    return c.json({ user: userData });
  } catch (error) {
    console.log('Error fetching user data:', error);
    return c.json({ error: 'Internal server error while fetching user' }, 500);
  }
});

// Submit project request
app.post('/make-server-ae8fa403/projects', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      console.log('Authorization error while submitting project:', error);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { projectName, projectDescription, developerType, budget, timeline, paymentMethod } = await c.req.json();

    if (!projectName || !projectDescription || !developerType || !budget || !timeline || !paymentMethod) {
      return c.json({ error: 'All fields are required' }, 400);
    }

    const projectId = crypto.randomUUID();
    const project = {
      id: projectId,
      userId: user.id,
      projectName,
      projectDescription,
      developerType,
      budget,
      timeline,
      paymentMethod,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`project:${projectId}`, project);
    
    // Add to user's projects list
    const userProjects = await kv.get(`userProjects:${user.id}`) || [];
    userProjects.push(projectId);
    await kv.set(`userProjects:${user.id}`, userProjects);

    return c.json({ message: 'Project submitted successfully', project }, 201);
  } catch (error) {
    console.log('Error submitting project:', error);
    return c.json({ error: 'Internal server error while submitting project' }, 500);
  }
});

// Get user's projects
app.get('/make-server-ae8fa403/projects/my', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      console.log('Authorization error while fetching user projects:', error);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const projectIds = await kv.get(`userProjects:${user.id}`) || [];
    const projects = await kv.mget(projectIds.map((id: string) => `project:${id}`));

    return c.json({ projects: projects.filter(p => p !== null) });
  } catch (error) {
    console.log('Error fetching user projects:', error);
    return c.json({ error: 'Internal server error while fetching projects' }, 500);
  }
});

// Request new developer for project
app.post('/make-server-ae8fa403/projects/:id/request-new-developer', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      console.log('Authorization error while requesting new developer:', error);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const projectId = c.req.param('id');
    const project = await kv.get(`project:${projectId}`);
    
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    if (project.userId !== user.id) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const updatedProject = {
      ...project,
      needsNewDeveloper: true,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`project:${projectId}`, updatedProject);

    return c.json({ message: 'Request sent to admin' });
  } catch (error) {
    console.log('Error requesting new developer:', error);
    return c.json({ error: 'Internal server error while requesting new developer' }, 500);
  }
});

// Get developer details
app.get('/make-server-ae8fa403/developers/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const developerId = c.req.param('id');
    const developer = await kv.get(`developer:${developerId}`);
    
    if (!developer) {
      return c.json({ error: 'Developer not found' }, 404);
    }

    return c.json({ developer });
  } catch (error) {
    console.log('Error fetching developer:', error);
    return c.json({ error: 'Internal server error while fetching developer' }, 500);
  }
});

// Admin: Get all projects
app.get('/make-server-ae8fa403/admin/projects', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      console.log('Authorization error while admin fetching projects:', error);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    const userData = await kv.get(`user:${user.id}`);
    if (!userData || !userData.isAdmin) {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const allProjects = await kv.getByPrefix('project:');
    
    // Get user data for each project
    const projectsWithUsers = await Promise.all(
      allProjects.map(async (project: any) => {
        const user = await kv.get(`user:${project.userId}`);
        return {
          ...project,
          username: user?.username || 'Unknown',
          userEmail: user?.email || 'Unknown',
        };
      })
    );

    return c.json({ projects: projectsWithUsers });
  } catch (error) {
    console.log('Error fetching all projects for admin:', error);
    return c.json({ error: 'Internal server error while fetching projects' }, 500);
  }
});

// Admin: Update project status (approve/reject/assign)
app.patch('/make-server-ae8fa403/admin/projects/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      console.log('Authorization error while updating project:', error);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    const userData = await kv.get(`user:${user.id}`);
    if (!userData || !userData.isAdmin) {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const projectId = c.req.param('id');
    const { status, assignedDeveloper, assignedDeveloperId } = await c.req.json();

    const project = await kv.get(`project:${projectId}`);
    
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const updatedProject = {
      ...project,
      status,
      assignedDeveloper: assignedDeveloper || project.assignedDeveloper,
      assignedDeveloperId: assignedDeveloperId || project.assignedDeveloperId,
      updatedAt: new Date().toISOString(),
      approvedAt: status === 'approved' ? new Date().toISOString() : project.approvedAt,
      nomadCommission: 0.20, // 20% commission
      needsNewDeveloper: false,
    };

    await kv.set(`project:${projectId}`, updatedProject);

    // Track revenue if approved
    if (status === 'approved' && project.budget) {
      const revenue = await kv.get('analytics:totalRevenue') || 0;
      const budgetNum = parseFloat(project.budget.replace(/[^0-9.]/g, ''));
      if (!isNaN(budgetNum)) {
        await kv.set('analytics:totalRevenue', revenue + (budgetNum * 0.20));
      }
    }

    return c.json({ message: 'Project updated successfully', project: updatedProject });
  } catch (error) {
    console.log('Error updating project:', error);
    return c.json({ error: 'Internal server error while updating project' }, 500);
  }
});

// Admin: Get all developers
app.get('/make-server-ae8fa403/admin/developers', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      console.log('Authorization error while fetching developers:', error);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    const userData = await kv.get(`user:${user.id}`);
    if (!userData || !userData.isAdmin) {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const developers = await kv.getByPrefix('developer:');
    return c.json({ developers });
  } catch (error) {
    console.log('Error fetching developers:', error);
    return c.json({ error: 'Internal server error while fetching developers' }, 500);
  }
});

// Admin: Add developer
app.post('/make-server-ae8fa403/admin/developers', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      console.log('Authorization error while adding developer:', error);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    const userData = await kv.get(`user:${user.id}`);
    if (!userData || !userData.isAdmin) {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const { name, specialization, email, portfolio, bio, skills, hourlyRate } = await c.req.json();

    if (!name || !specialization || !email) {
      return c.json({ error: 'Name, specialization, and email are required' }, 400);
    }

    const developerId = crypto.randomUUID();
    const developer = {
      id: developerId,
      name,
      specialization,
      email,
      portfolio: portfolio || '',
      bio: bio || '',
      skills: skills || [],
      hourlyRate: hourlyRate || '',
      createdAt: new Date().toISOString(),
    };

    await kv.set(`developer:${developerId}`, developer);

    return c.json({ message: 'Developer added successfully', developer }, 201);
  } catch (error) {
    console.log('Error adding developer:', error);
    return c.json({ error: 'Internal server error while adding developer' }, 500);
  }
});

// Admin: Get analytics
app.get('/make-server-ae8fa403/admin/analytics', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    const userData = await kv.get(`user:${user.id}`);
    if (!userData || !userData.isAdmin) {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    // Get all users
    const allUsers = await kv.getByPrefix('user:');
    
    // Get all projects
    const allProjects = await kv.getByPrefix('project:');
    
    // Calculate revenue
    const totalRevenue = await kv.get('analytics:totalRevenue') || 0;
    
    // Active users (users who've been active in last 5 minutes)
    const activeUsers = Array.from(activeSessions.values());
    
    // Calculate stats
    const approvedProjects = allProjects.filter((p: any) => p.status === 'approved');
    const pendingProjects = allProjects.filter((p: any) => p.status === 'pending');
    
    return c.json({
      totalUsers: allUsers.length,
      activeUsers: activeUsers.length,
      totalProjects: allProjects.length,
      approvedProjects: approvedProjects.length,
      pendingProjects: pendingProjects.length,
      totalRevenue,
      users: allUsers.map((u: any) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        isAdmin: u.isAdmin,
        createdAt: u.createdAt,
      })),
    });
  } catch (error) {
    console.log('Error fetching analytics:', error);
    return c.json({ error: 'Internal server error while fetching analytics' }, 500);
  }
});

// Initialize default developers and admin user
app.post('/make-server-ae8fa403/initialize', async (c) => {
  try {
    // Check if already initialized
    const initialized = await kv.get('system:initialized');
    if (initialized) {
      return c.json({ message: 'System already initialized' });
    }

    // Create default developers
    const defaultDevelopers = [
      { 
        name: 'John Smith', 
        specialization: 'Roblox Developer', 
        email: 'john@nomad.dev',
        portfolio: 'https://github.com/johnsmith',
        bio: 'Experienced Roblox developer with 5+ years of game development experience.',
        skills: ['Lua', 'Roblox Studio', 'Game Design', '3D Modeling'],
        hourlyRate: '$75/hr',
      },
      { 
        name: 'Sarah Johnson', 
        specialization: 'Web Developer', 
        email: 'sarah@nomad.dev',
        portfolio: 'https://sarahjohnson.dev',
        bio: 'Full-stack web developer specializing in React and Node.js.',
        skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
        hourlyRate: '$85/hr',
      },
      { 
        name: 'Mike Chen', 
        specialization: 'App Developer', 
        email: 'mike@nomad.dev',
        portfolio: 'https://mikechen.portfolio.com',
        bio: 'Mobile app developer with expertise in iOS and Android development.',
        skills: ['Swift', 'Kotlin', 'React Native', 'Firebase'],
        hourlyRate: '$80/hr',
      },
      { 
        name: 'Emily Brown', 
        specialization: 'Full Stack Developer', 
        email: 'emily@nomad.dev',
        portfolio: 'https://emilybrown.com',
        bio: 'Versatile full-stack developer with experience across multiple platforms.',
        skills: ['JavaScript', 'Python', 'AWS', 'Docker'],
        hourlyRate: '$90/hr',
      },
    ];

    for (const dev of defaultDevelopers) {
      const developerId = crypto.randomUUID();
      await kv.set(`developer:${developerId}`, {
        id: developerId,
        ...dev,
        createdAt: new Date().toISOString(),
      });
    }

    // Mark as initialized
    await kv.set('system:initialized', true);
    await kv.set('analytics:totalRevenue', 0);

    return c.json({ message: 'System initialized successfully' });
  } catch (error) {
    console.log('Error initializing system:', error);
    return c.json({ error: 'Internal server error during initialization' }, 500);
  }
});

// Make user admin (for testing purposes)
app.post('/make-server-ae8fa403/make-admin/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const userData = await kv.get(`user:${userId}`);
    
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    await kv.set(`user:${userId}`, {
      ...userData,
      isAdmin: true,
    });

    return c.json({ message: 'User is now an admin' });
  } catch (error) {
    console.log('Error making user admin:', error);
    return c.json({ error: 'Internal server error while updating user' }, 500);
  }
});

Deno.serve(app.fetch);
