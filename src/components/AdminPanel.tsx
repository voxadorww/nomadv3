import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { createClient } from '@supabase/supabase-js';
import { CheckCircle2, Clock, XCircle, Plus, Search, Users, DollarSign, TrendingUp, Activity, Eye } from 'lucide-react';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export function AdminPanel() {
  const [projects, setProjects] = useState<any[]>([]);
  const [developers, setDevelopers] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedDeveloper, setSelectedDeveloper] = useState('');
  const [selectedDeveloperId, setSelectedDeveloperId] = useState('');
  
  // Developer form state
  const [newDevName, setNewDevName] = useState('');
  const [newDevSpecialization, setNewDevSpecialization] = useState('');
  const [newDevEmail, setNewDevEmail] = useState('');
  const [newDevPortfolio, setNewDevPortfolio] = useState('');
  const [newDevBio, setNewDevBio] = useState('');
  const [newDevSkills, setNewDevSkills] = useState('');
  const [newDevHourlyRate, setNewDevHourlyRate] = useState('');
  const [showAddDevDialog, setShowAddDevDialog] = useState(false);
  const [viewingDeveloper, setViewingDeveloper] = useState<any>(null);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProjects();
    fetchDevelopers();
    fetchAnalytics();
    
    // Refresh analytics every 30 seconds for real-time data
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchQuery, statusFilter]);

  const fetchProjects = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ae8fa403/admin/projects`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchDevelopers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ae8fa403/admin/developers`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDevelopers(data.developers || []);
      }
    } catch (err) {
      console.error('Error fetching developers:', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ae8fa403/admin/analytics`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.projectName.toLowerCase().includes(query) ||
        p.username.toLowerCase().includes(query) ||
        p.developerType.toLowerCase().includes(query)
      );
    }

    setFilteredProjects(filtered);
  };

  const updateProjectStatus = async (projectId: string, status: string, assignedDeveloper?: string, assignedDeveloperId?: string) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('You must be logged in');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ae8fa403/admin/projects/${projectId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ status, assignedDeveloper, assignedDeveloperId }),
        }
      );

      if (response.ok) {
        setSuccess('Project updated successfully');
        fetchProjects();
        fetchAnalytics();
        setSelectedProject(null);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update project');
      }
    } catch (err) {
      console.error('Error updating project:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addDeveloper = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('You must be logged in');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ae8fa403/admin/developers`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            name: newDevName,
            specialization: newDevSpecialization,
            email: newDevEmail,
            portfolio: newDevPortfolio,
            bio: newDevBio,
            skills: newDevSkills.split(',').map(s => s.trim()).filter(s => s),
            hourlyRate: newDevHourlyRate,
          }),
        }
      );

      if (response.ok) {
        setSuccess('Developer added successfully');
        setNewDevName('');
        setNewDevSpecialization('');
        setNewDevEmail('');
        setNewDevPortfolio('');
        setNewDevBio('');
        setNewDevSkills('');
        setNewDevHourlyRate('');
        setShowAddDevDialog(false);
        fetchDevelopers();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to add developer');
      }
    } catch (err) {
      console.error('Error adding developer:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle2 className="size-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            <XCircle className="size-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            <Clock className="size-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage project requests, developers, and view analytics
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 text-green-900 border-green-200">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="developers">Developers</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm">Total Users</CardTitle>
                  <Users className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{analytics?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Registered users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm">Active Users</CardTitle>
                  <Activity className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-green-600">{analytics?.activeUsers || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Online right now
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm">Total Projects</CardTitle>
                  <TrendingUp className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{analytics?.totalProjects || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics?.pendingProjects || 0} pending review
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm">Total Revenue</CardTitle>
                  <DollarSign className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">${analytics?.totalRevenue?.toFixed(2) || '0.00'}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    20% commission
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Project Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Approved Projects</span>
                      <Badge className="bg-green-100 text-green-700">
                        {analytics?.approvedProjects || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pending Projects</span>
                      <Badge className="bg-yellow-100 text-yellow-700">
                        {analytics?.pendingProjects || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Developers</span>
                      <Badge className="bg-blue-100 text-blue-700">
                        {developers.length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {projects.slice(0, 5).map((project) => (
                      <div key={project.id} className="flex justify-between items-start text-sm">
                        <div>
                          <p className="font-medium">{project.projectName}</p>
                          <p className="text-xs text-muted-foreground">{project.username}</p>
                        </div>
                        {getStatusBadge(project.status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Requests</CardTitle>
                <CardDescription>Review and manage all project requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {filteredProjects.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No projects found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProjects.map((project) => (
                      <div
                        key={project.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{project.projectName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {project.developerType}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Requested by: {project.username} ({project.userEmail})
                            </p>
                          </div>
                          {getStatusBadge(project.status)}
                        </div>
                        <p className="text-sm mb-2">{project.projectDescription}</p>
                        
                        <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                          <div>
                            <span className="font-medium">Budget:</span> {project.budget}
                          </div>
                          <div>
                            <span className="font-medium">Timeline:</span> {project.timeline}
                          </div>
                          <div>
                            <span className="font-medium">Payment:</span> {project.paymentMethod}
                          </div>
                        </div>

                        {project.assignedDeveloper && (
                          <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                            <p className="text-sm">
                              <span className="font-medium">Assigned Developer:</span>{' '}
                              {project.assignedDeveloper}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Nomad Commission: 20%
                            </p>
                          </div>
                        )}

                        {project.needsNewDeveloper && (
                          <Alert className="mb-3">
                            <AlertDescription>
                              Client requested a new developer
                            </AlertDescription>
                          </Alert>
                        )}

                        {project.status === 'pending' && (
                          <div className="flex gap-2 mt-3 pt-3 border-t">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  onClick={() => setSelectedProject(project)}
                                >
                                  Approve & Assign
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Assign Developer</DialogTitle>
                                  <DialogDescription>
                                    Select a developer to assign to this project
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label>Developer</Label>
                                    <Select
                                      value={selectedDeveloperId}
                                      onValueChange={(value) => {
                                        setSelectedDeveloperId(value);
                                        const dev = developers.find(d => d.id === value);
                                        setSelectedDeveloper(dev?.name || '');
                                      }}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select developer" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {developers.map((dev) => (
                                          <SelectItem key={dev.id} value={dev.id}>
                                            {dev.name} - {dev.specialization} ({dev.hourlyRate})
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Button
                                    onClick={() => {
                                      if (selectedProject && selectedDeveloper) {
                                        updateProjectStatus(
                                          selectedProject.id,
                                          'approved',
                                          selectedDeveloper,
                                          selectedDeveloperId
                                        );
                                        setSelectedDeveloper('');
                                        setSelectedDeveloperId('');
                                      }
                                    }}
                                    disabled={!selectedDeveloper || loading}
                                  >
                                    Approve & Assign
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateProjectStatus(project.id, 'rejected')}
                              disabled={loading}
                            >
                              Reject
                            </Button>
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground mt-2">
                          Submitted {new Date(project.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="developers" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Developers</CardTitle>
                    <CardDescription>Manage your team of developers</CardDescription>
                  </div>
                  <Dialog open={showAddDevDialog} onOpenChange={setShowAddDevDialog}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="size-4" />
                        Add Developer
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add New Developer</DialogTitle>
                        <DialogDescription>
                          Add a new developer to your team
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={addDeveloper} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="devName">Name *</Label>
                            <Input
                              id="devName"
                              value={newDevName}
                              onChange={(e) => setNewDevName(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="devEmail">Email *</Label>
                            <Input
                              id="devEmail"
                              type="email"
                              value={newDevEmail}
                              onChange={(e) => setNewDevEmail(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="devSpecialization">Specialization *</Label>
                            <Select
                              value={newDevSpecialization}
                              onValueChange={setNewDevSpecialization}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select specialization" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Roblox Developer">Roblox Developer</SelectItem>
                                <SelectItem value="Web Developer">Web Developer</SelectItem>
                                <SelectItem value="App Developer">App Developer</SelectItem>
                                <SelectItem value="Full Stack Developer">Full Stack Developer</SelectItem>
                                <SelectItem value="Game Developer">Game Developer</SelectItem>
                                <SelectItem value="UI/UX Designer">UI/UX Designer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="devHourlyRate">Hourly Rate</Label>
                            <Input
                              id="devHourlyRate"
                              placeholder="e.g., $75/hr"
                              value={newDevHourlyRate}
                              onChange={(e) => setNewDevHourlyRate(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="devPortfolio">Portfolio URL</Label>
                          <Input
                            id="devPortfolio"
                            type="url"
                            placeholder="https://..."
                            value={newDevPortfolio}
                            onChange={(e) => setNewDevPortfolio(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="devBio">Bio</Label>
                          <Textarea
                            id="devBio"
                            rows={3}
                            placeholder="Brief description of experience and expertise..."
                            value={newDevBio}
                            onChange={(e) => setNewDevBio(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="devSkills">Skills (comma-separated)</Label>
                          <Input
                            id="devSkills"
                            placeholder="e.g., React, Node.js, TypeScript"
                            value={newDevSkills}
                            onChange={(e) => setNewDevSkills(e.target.value)}
                          />
                        </div>
                        <Button type="submit" disabled={loading}>
                          {loading ? 'Adding...' : 'Add Developer'}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {developers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No developers yet. Add your first developer!
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {developers.map((dev) => (
                      <div
                        key={dev.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <Users className="size-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{dev.name}</h3>
                            <p className="text-sm text-muted-foreground">{dev.specialization}</p>
                            <p className="text-sm text-muted-foreground">{dev.email}</p>
                            {dev.hourlyRate && (
                              <p className="text-sm font-medium text-green-600">{dev.hourlyRate}</p>
                            )}
                          </div>
                        </div>
                        {dev.bio && (
                          <p className="text-sm text-muted-foreground mb-2">{dev.bio}</p>
                        )}
                        {dev.skills && dev.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {dev.skills.map((skill: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2 mt-3">
                          {dev.portfolio && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(dev.portfolio, '_blank')}
                            >
                              View Portfolio
                            </Button>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setViewingDeveloper(dev)}
                              >
                                <Eye className="size-3 mr-1" />
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Developer Details</DialogTitle>
                              </DialogHeader>
                              {viewingDeveloper && (
                                <div className="space-y-4">
                                  <div>
                                    <Label>Name</Label>
                                    <p>{viewingDeveloper.name}</p>
                                  </div>
                                  <div>
                                    <Label>Email</Label>
                                    <p>{viewingDeveloper.email}</p>
                                  </div>
                                  <div>
                                    <Label>Specialization</Label>
                                    <p>{viewingDeveloper.specialization}</p>
                                  </div>
                                  {viewingDeveloper.hourlyRate && (
                                    <div>
                                      <Label>Hourly Rate</Label>
                                      <p>{viewingDeveloper.hourlyRate}</p>
                                    </div>
                                  )}
                                  {viewingDeveloper.bio && (
                                    <div>
                                      <Label>Bio</Label>
                                      <p className="text-sm text-muted-foreground">{viewingDeveloper.bio}</p>
                                    </div>
                                  )}
                                  {viewingDeveloper.portfolio && (
                                    <div>
                                      <Label>Portfolio</Label>
                                      <a 
                                        href={viewingDeveloper.portfolio} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-sm text-purple-600 hover:underline"
                                      >
                                        {viewingDeveloper.portfolio}
                                      </a>
                                    </div>
                                  )}
                                  {viewingDeveloper.skills && viewingDeveloper.skills.length > 0 && (
                                    <div>
                                      <Label>Skills</Label>
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {viewingDeveloper.skills.map((skill: string, idx: number) => (
                                          <Badge key={idx} variant="secondary">
                                            {skill}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage all registered users</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.users ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics.users.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            {user.isAdmin ? (
                              <Badge className="bg-purple-100 text-purple-700">Admin</Badge>
                            ) : (
                              <Badge variant="secondary">User</Badge>
                            )}
                          </TableCell>
                          <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading users...
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
