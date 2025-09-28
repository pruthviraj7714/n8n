import { Zap, Github, Twitter, Mail, ExternalLink, Sparkles } from "lucide-react"

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-card/30 via-card/60 to-card border-t border-border/30 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-0 right-1/3 w-64 h-64 bg-accent/8 rounded-full blur-2xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16">
            <div className="space-y-6 md:col-span-1">
              <div className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300 group-hover:scale-110">
                  <Zap className="w-6 h-6 text-primary-foreground animate-pulse" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Zaplane
                </span>
              </div>
              <p className="text-base text-muted-foreground leading-relaxed max-w-xs">
                Powerful automation platform revolutionizing workflows with seamless Telegram, Email, and AI Agents integration.
              </p>
              <div className="flex items-center space-x-2 text-sm text-accent">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="font-medium">Trusted by 10,000+ users</span>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-foreground relative">
                Product
                <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full"></div>
              </h3>
              <div className="space-y-4">
                <a
                  href="/#features"
                  className="group flex items-center text-muted-foreground hover:text-accent transition-all duration-300 hover:translate-x-1"
                >
                  <span>Features</span>
                  <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
                <a
                  href="/#pricing"
                  className="group flex items-center text-muted-foreground hover:text-accent transition-all duration-300 hover:translate-x-1"
                >
                  <span>Pricing</span>
                  <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
                <a
                  href="#"
                  className="group flex items-center text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1"
                >
                  <span>Documentation</span>
                  <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
                <a
                  href="#"
                  className="group flex items-center text-muted-foreground hover:text-chart-2 transition-all duration-300 hover:translate-x-1"
                >
                  <span>API Reference</span>
                  <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
                <a
                  href="#"
                  className="group flex items-center text-muted-foreground hover:text-accent transition-all duration-300 hover:translate-x-1"
                >
                  <span>Integrations</span>
                  <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-foreground relative">
                Company
                <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-accent to-chart-2 rounded-full"></div>
              </h3>
              <div className="space-y-4">
                <a
                  href="#"
                  className="group flex items-center text-muted-foreground hover:text-accent transition-all duration-300 hover:translate-x-1"
                >
                  <span>About Us</span>
                  <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
                <a
                  href="#"
                  className="group flex items-center text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1"
                >
                  <span>Blog</span>
                  <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
                <a
                  href="#"
                  className="group flex items-center text-muted-foreground hover:text-chart-2 transition-all duration-300 hover:translate-x-1"
                >
                  <span>Careers</span>
                  <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
                <a
                  href="#"
                  className="group flex items-center text-muted-foreground hover:text-accent transition-all duration-300 hover:translate-x-1"
                >
                  <span>Contact</span>
                  <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
                <a
                  href="#"
                  className="group flex items-center text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1"
                >
                  <span>Press Kit</span>
                  <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-foreground relative">
                Connect
                <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-chart-2 to-primary rounded-full"></div>
              </h3>
              <div className="space-y-4">
                <a
                  href="#"
                  className="group flex items-center text-muted-foreground hover:text-accent transition-all duration-300 hover:translate-x-1"
                >
                  <span>Privacy Policy</span>
                  <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
                <a
                  href="#"
                  className="group flex items-center text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1"
                >
                  <span>Terms of Service</span>
                  <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
                <a
                  href="#"
                  className="group flex items-center text-muted-foreground hover:text-chart-2 transition-all duration-300 hover:translate-x-1"
                >
                  <span>Support Center</span>
                  <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
                <a
                  href="#"
                  className="group flex items-center text-muted-foreground hover:text-accent transition-all duration-300 hover:translate-x-1"
                >
                  <span>Status Page</span>
                  <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
              </div>

              <div className="pt-4">
                <p className="text-sm font-medium text-muted-foreground mb-4">Follow us</p>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="group p-3 rounded-xl bg-card/50 border border-border/30 hover:border-accent/50 hover:bg-accent/10 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-accent/25"
                  >
                    <Github className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors duration-300" />
                    <span className="sr-only">GitHub</span>
                  </a>
                  <a
                    href="#"
                    className="group p-3 rounded-xl bg-card/50 border border-border/30 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/25"
                  >
                    <Twitter className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                    <span className="sr-only">Twitter</span>
                  </a>
                  <a
                    href="#"
                    className="group p-3 rounded-xl bg-card/50 border border-border/30 hover:border-chart-2/50 hover:bg-chart-2/10 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-chart-2/25"
                  >
                    <Mail className="w-5 h-5 text-muted-foreground group-hover:text-chart-2 transition-colors duration-300" />
                    <span className="sr-only">Email</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border/30 mt-16 pt-8 flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-muted-foreground">
              <p>© {new Date().getUTCFullYear()} Zaplane. All rights reserved.</p>
              <div className="flex items-center space-x-4">
                <span className="hidden md:block">•</span>
                <span>Made with 💜 for automation enthusiasts</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2 text-accent">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                <span className="font-medium">All systems operational</span>
              </div>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors duration-300 font-medium"
              >
                v2.1.0
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-chart-2 opacity-50"></div>
    </footer>
  )
}