import { useLocation } from 'wouter';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Code, Globe, Smartphone, Gamepad2, CheckCircle } from 'lucide-react';

export function HomePage() {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: Code,
      title: 'Expert Developers',
      description: 'Access a network of skilled developers specializing in various technologies',
    },
    {
      icon: Globe,
      title: 'Web Development',
      description: 'Build modern, responsive websites and web applications',
    },
    {
      icon: Smartphone,
      title: 'App Development',
      description: 'Create native and cross-platform mobile applications',
    },
    {
      icon: Gamepad2,
      title: 'Game Development',
      description: 'Develop engaging games for Roblox and other platforms',
    },
  ];

  const benefits = [
    '20% transparent commission structure',
    'Vetted and experienced developers',
    'Fast project matching and approval',
    'Secure payment and milestone tracking',
    'Dedicated project management support',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Welcome to Nomad
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Your premier development hub agency connecting visionaries with top-tier developers
            for Roblox games, websites, applications, and more.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => setLocation('/signup')}>
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => setLocation('/login')}>
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="size-6 text-white" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* How It Works */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl text-center">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-purple-600">1</span>
                </div>
                <h3 className="font-medium mb-2">Submit Your Project</h3>
                <p className="text-sm text-muted-foreground">
                  Create an account and submit your project requirements with detailed specifications
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-purple-600">2</span>
                </div>
                <h3 className="font-medium mb-2">Get Matched</h3>
                <p className="text-sm text-muted-foreground">
                  Our team reviews your request and assigns the perfect developer for your needs
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-purple-600">3</span>
                </div>
                <h3 className="font-medium mb-2">Start Building</h3>
                <p className="text-sm text-muted-foreground">
                  Work with your assigned developer to bring your vision to life
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="grid gap-8 md:grid-cols-2 items-center">
          <div>
            <h2 className="text-3xl mb-4">Why Choose Nomad?</h2>
            <p className="text-muted-foreground mb-6">
              We're committed to making development accessible, transparent, and efficient
              for everyone from indie creators to established businesses.
            </p>
            <ul className="space-y-3">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <Card className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
            <CardHeader>
              <CardTitle className="text-white">Ready to Get Started?</CardTitle>
              <CardDescription className="text-purple-100">
                Join hundreds of satisfied clients who've brought their projects to life with Nomad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                size="lg"
                variant="secondary"
                className="w-full"
                onClick={() => setLocation('/signup')}
              >
                Create Free Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}