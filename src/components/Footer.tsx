import { Mail, MessageSquare, Github, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">N</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Nomad
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Your premier development hub agency connecting visionaries with top-tier developers
              for Roblox games, websites, applications, and more.
            </p>
            <p className="text-xs text-muted-foreground">
              © 2024 Nomad. All rights reserved.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="mailto:contact@nomad.dev" 
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="size-4" />
                  contact@nomadtm.shop
                </a>
              </li>
              <li>
                <a 
                  href="https://discord.gg/DRRJdm5c5S" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MessageSquare className="size-4" />
                  Join our Discord
                </a>
              </li>
              <li>
                <a 
                  href="https://www.tiktok.com/@nomadenterprise" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Twitter className="size-4" />
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
