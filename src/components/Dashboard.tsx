import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { createClient } from '@supabase/supabase-js';
import { CheckCircle2, Clock, XCircle, Plus, Eye, RefreshCw } from 'lucide-react';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export function Dashboard() {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [developerType, setDeveloperType] = useState('');
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [requestingNewDeveloper, setRequestingNewDeveloper] = useState<string | null>(null);
  const [viewingDeveloper, setViewingDeveloper] = useState<any>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('No active session');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ae8fa403/projects/my`,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('You must be logged in to submit a project');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ae8fa403/projects`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            projectName,
            projectDescription,
            developerType,
            budget,
            timeline,
            paymentMethod,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to submit project');
        setLoading(false);
        return;
      }

      setSuccess('Project submitted successfully! An admin will review it shortly.');
      setProjectName('');
      setProjectDescription('');
      setDeveloperType('');
      setBudget('');
      setTimeline('');
      setPaymentMethod('');
      setShowForm(false);
      fetchProjects();
    } catch (err) {
      console.error('Error submitting project:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const requestNewDeveloper = async (targetProjectId: string) => {
    setRequestingNewDeveloper(targetProjectId);
    setError('');
    setSuccess('');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('You must be logged in');
        setRequestingNewDeveloper(null);
        return;
      }
  
      // Use the imported projectId for the base URL and targetProjectId for the path
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ae8fa403/projects/${targetProjectId}/request-new-developer`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );
  
      if (response.ok) {
        setSuccess('Request sent to admin. A new developer will be assigned soon.');
        fetchProjects();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to request new developer');
      }
    } catch (err) {
      console.error('Error requesting new developer:', err);
      setError('An unexpected error occurred');
    } finally {
      setRequestingNewDeveloper(null);
    }
  };

  const fetchDeveloperDetails = async (developerId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;
  
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ae8fa403/developers/${developerId}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );
  
      if (response.ok) {
        const data = await response.json();
        setViewingDeveloper(data.developer);
      }
    } catch (err) {
      console.error('Error fetching developer details:', err);
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
          <h1 className="text-3xl mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Submit project requests and track their status
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 text-green-900 border-green-200 dark:bg-green-900/20 dark:text-green-100">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{projects.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl">
                {projects.filter(p => p.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {!showForm ? (
          <div className="mb-8">
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="size-4" />
              New Project Request
            </Button>
          </div>
        ) : (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Submit New Project Request</CardTitle>
              <CardDescription>
                Fill out the form below to request a developer for your project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    placeholder="e.g., My Roblox Game"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectDescription">Project Description</Label>
                  <Textarea
                    id="projectDescription"
                    placeholder="Describe your project requirements, goals, and timeline..."
                    rows={5}
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="developerType">Developer Type</Label>
                    <Select value={developerType} onValueChange={setDeveloperType} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select developer type" />
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
                    <Label htmlFor="budget">Budget</Label>
                    <Input
                      id="budget"
                      placeholder="e.g., $500"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeline">Timeline</Label>
                    <Input
                      id="timeline"
                      placeholder="e.g., 3 months"
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Robux">Robux</SelectItem>
                        <SelectItem value="Skrill">Skrill</SelectItem>
                        <SelectItem value="Western Union">Western Union</SelectItem>
                        <SelectItem value="Cryptocurrency">Cryptocurrency</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setError('');
                      setSuccess('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Your Projects</CardTitle>
            <CardDescription>
              View all your submitted project requests and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No projects yet. Submit your first project request above!
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
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
                      </div>
                      {getStatusBadge(project.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {project.projectDescription}
                    </p>
                    
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

                    {project.assignedDeveloper && project.assignedDeveloperId && (
                      <div className="mt-2 pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <p className="text-sm">
                            <span className="font-medium">Assigned Developer:</span>{' '}
                            {project.assignedDeveloper}
                          </p>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => fetchDeveloperDetails(project.assignedDeveloperId)}
                                >
                                  <Eye className="size-3 mr-1" />
                                  View Profile
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Developer Profile</DialogTitle>
                                </DialogHeader>
                                {viewingDeveloper && (
                                  <div className="space-y-4">
                                    <div>
                                      <Label>Name</Label>
                                      <p>{viewingDeveloper.name}</p>
                                    </div>
                                    <div>
                                      <Label>Specialization</Label>
                                      <p>{viewingDeveloper.specialization}</p>
                                    </div>
                                    {viewingDeveloper.hourlyRate && (
                                      <div>
                                        <Label>Hourly Rate</Label>
                                        <p className="text-green-600 font-medium">{viewingDeveloper.hourlyRate}</p>
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => requestNewDeveloper(project.id)}
                              disabled={requestingNewDeveloper === project.id}
                            >
                              <RefreshCw className={`size-3 mr-1 ${requestingNewDeveloper === project.id ? 'animate-spin' : ''}`} />
                              Request Different Developer
                          </Button>
                          </div>
                        </div>
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
      </div>
    </div>
  );
}
