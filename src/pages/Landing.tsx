import { Link } from 'react-router-dom';
import { 
  Chrome, 
  Zap, 
  Shield, 
  Sparkles, 
  ArrowRight,
  Building2,
  HeartPulse,
  ShoppingCart,
  Users,
  FileSpreadsheet,
  MousePointer,
  Play,
  Download,
  ExternalLink,
  Github,
  MessageCircle,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadExtension } from '@/lib/extensionZip';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient - light corporate style */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-background" />
        
        {/* Floating icons background */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-20 left-10 animate-float">
            <FileSpreadsheet className="w-12 h-12 text-primary" />
          </div>
          <div className="absolute top-40 right-20 animate-float" style={{ animationDelay: '1s' }}>
            <MousePointer className="w-10 h-10 text-primary" />
          </div>
          <div className="absolute bottom-40 left-1/4 animate-float" style={{ animationDelay: '2s' }}>
            <Zap className="w-8 h-8 text-warning" />
          </div>
          <div className="absolute top-1/3 right-1/3 animate-float" style={{ animationDelay: '1.5s' }}>
            <Shield className="w-10 h-10 text-success" />
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="text-center space-y-8">
            {/* Logo */}
            <div className="inline-flex items-center justify-center">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-primary-foreground">Qa</span>
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold">
                <span className="text-primary">QA</span>
                <span className="text-foreground">FormFiller</span>
              </h1>
              <p className="text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto">
                Automate Your Data Entry. Fill forms instantly with data from Excel spreadsheets.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link to="/app">
                <Button size="lg" className="gap-2 gradient-primary text-primary-foreground shadow-md text-lg px-8 py-6">
                  <Play className="w-5 h-5" />
                  Launch App
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6 border-primary text-primary hover:bg-primary/5" asChild>
                <a href="#download">
                  <Download className="w-5 h-5" />
                  Get Extension
                </a>
              </Button>
            </div>

            {/* Browser icons */}
            <div className="flex items-center justify-center gap-8 pt-8">
              <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                <Chrome className="w-8 h-8" />
                <span className="font-medium">Chrome</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm0 2.4c5.3 0 9.6 4.3 9.6 9.6s-4.3 9.6-9.6 9.6-9.6-4.3-9.6-9.6 4.3-9.6 9.6-9.6zM7.2 12c0-2.65 2.15-4.8 4.8-4.8v9.6c-2.65 0-4.8-2.15-4.8-4.8z"/>
                </svg>
                <span className="font-medium">Firefox</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm0 2.4c2.6 0 5 1.1 6.8 2.8L12 12V2.4zm-1.2 0v9.6l-6.8-6.8c1.8-1.7 4.2-2.8 6.8-2.8zm-9.6 9.6c0-2.6 1.1-5 2.8-6.8l6.8 6.8H2.4zm2.8 8c-1.7-1.8-2.8-4.2-2.8-6.8h9.6l-6.8 6.8zm6.8 1.6c-2.6 0-5-1.1-6.8-2.8l6.8-6.8v9.6zm1.2 0v-9.6l6.8 6.8c-1.8 1.7-4.2 2.8-6.8 2.8zm9.6-9.6c0 2.6-1.1 5-2.8 6.8l-6.8-6.8h9.6z"/>
                </svg>
                <span className="font-medium">Edge</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get started in just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Install Extension', desc: 'Add the browser extension with one click' },
              { step: '2', title: 'Upload Data', desc: 'Import your Excel or CSV file with form data' },
              { step: '3', title: 'Navigate to Form', desc: 'Go to any web form you want to fill' },
              { step: '4', title: 'Auto-Fill & Submit', desc: 'Watch as forms are filled automatically' },
            ].map((item, i) => (
              <div key={i} className="glass rounded-2xl p-6 text-center hover:border-primary/50 transition-all group">
                <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-md">
                  <span className="text-2xl font-bold text-primary-foreground">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Powerful Features</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need for efficient form automation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass rounded-2xl p-8 hover:border-primary/50 transition-all">
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6 shadow-md">
                <Zap className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Fill hundreds of form entries in seconds. Our optimized engine handles bulk data efficiently.
              </p>
            </div>

            <div className="glass rounded-2xl p-8 hover:border-primary/50 transition-all">
              <div className="w-14 h-14 rounded-xl bg-success flex items-center justify-center mb-6 shadow-md">
                <Shield className="w-7 h-7 text-success-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your data stays on your device. No cloud uploads, no tracking, complete privacy.
              </p>
            </div>

            <div className="glass rounded-2xl p-8 hover:border-primary/50 transition-all">
              <div className="w-14 h-14 rounded-xl bg-warning flex items-center justify-center mb-6 shadow-md">
                <Sparkles className="w-7 h-7 text-warning-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Smart Automation</h3>
              <p className="text-muted-foreground">
                Advanced field detection, custom JavaScript support, and intelligent error handling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-24 px-6 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Built For Every Industry</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From small businesses to enterprises, we've got you covered
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Building2, title: 'Business & Sales', desc: 'CRM data entry, lead forms' },
              { icon: HeartPulse, title: 'Healthcare', desc: 'Patient records, registrations' },
              { icon: ShoppingCart, title: 'E-commerce', desc: 'Product listings, orders' },
              { icon: Users, title: 'Human Resources', desc: 'Employee data, applications' },
            ].map((item, i) => (
              <div key={i} className="glass rounded-xl p-6 text-center hover:border-primary/50 transition-all">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Get the Extension</h2>
          <p className="text-muted-foreground text-lg mb-12">
            Download for your favorite browser and start automating today
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button 
              onClick={downloadExtension}
              className="glass rounded-xl p-6 hover:border-primary/50 transition-all flex flex-col items-center gap-4 group cursor-pointer border-0 bg-transparent w-full"
            >
              <Chrome className="w-12 h-12 text-foreground group-hover:text-primary transition-colors" />
              <div>
                <h3 className="font-semibold text-foreground">Chrome</h3>
                <p className="text-sm text-muted-foreground">v88+</p>
              </div>
              <Button size="sm" className="gap-2 gradient-primary text-primary-foreground shadow-md">
                <Download className="w-4 h-4" />
                Download
              </Button>
            </button>

            <div className="glass rounded-xl p-6 hover:border-primary/50 transition-all flex flex-col items-center gap-4 group">
              <svg className="w-12 h-12 text-foreground group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm0 2.4c5.3 0 9.6 4.3 9.6 9.6s-4.3 9.6-9.6 9.6-9.6-4.3-9.6-9.6 4.3-9.6 9.6-9.6zM7.2 12c0-2.65 2.15-4.8 4.8-4.8v9.6c-2.65 0-4.8-2.15-4.8-4.8z"/>
              </svg>
              <div>
                <h3 className="font-semibold text-foreground">Firefox</h3>
                <p className="text-sm text-muted-foreground">v78+</p>
              </div>
              <Button size="sm" variant="outline" className="gap-2 border-muted-foreground/30">
                Coming Soon
              </Button>
            </div>

            <div className="glass rounded-xl p-6 hover:border-primary/50 transition-all flex flex-col items-center gap-4 group">
              <svg className="w-12 h-12 text-foreground group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm0 2.4c2.6 0 5 1.1 6.8 2.8L12 12V2.4zm-1.2 0v9.6l-6.8-6.8c1.8-1.7 4.2-2.8 6.8-2.8zm-9.6 9.6c0-2.6 1.1-5 2.8-6.8l6.8 6.8H2.4zm2.8 8c-1.7-1.8-2.8-4.2-2.8-6.8h9.6l-6.8 6.8zm6.8 1.6c-2.6 0-5-1.1-6.8-2.8l6.8-6.8v9.6zm1.2 0v-9.6l6.8 6.8c-1.8 1.7-4.2 2.8-6.8 2.8zm9.6-9.6c0 2.6-1.1 5-2.8 6.8l-6.8-6.8h9.6z"/>
              </svg>
              <div>
                <h3 className="font-semibold text-foreground">Edge</h3>
                <p className="text-sm text-muted-foreground">v88+</p>
              </div>
              <Button size="sm" variant="outline" className="gap-2 border-muted-foreground/30">
                Coming Soon
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border bg-secondary/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md">
                  <span className="text-sm font-bold text-primary-foreground">Qa</span>
                </div>
                <div>
                  <span className="font-semibold text-foreground">QAFormFiller</span>
                  <p className="text-xs text-muted-foreground">v1.0</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Automate your data entry with powerful form filling capabilities.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/docs" className="text-muted-foreground hover:text-primary flex items-center gap-1"><BookOpen className="w-3 h-3" /> Documentation</Link></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Practice Form</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Video Tutorials</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Community</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary flex items-center gap-1"><Github className="w-4 h-4" /> GitHub</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary flex items-center gap-1"><MessageCircle className="w-4 h-4" /> Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">About</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Terms of Service</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2024 QAFormFiller. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
