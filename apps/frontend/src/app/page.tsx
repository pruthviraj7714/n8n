import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, Mail, MessageCircle, Zap, ArrowRight, CheckCircle, Sparkles, Shield, Rocket } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-64 h-64 bg-chart-2/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <header className="border-b border-border/30 bg-card/20 backdrop-blur-lg sticky top-0 z-50 shadow-lg shadow-primary/5">
        <div className="mx-auto px-6 py-4 flex items-center justify-between max-w-7xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
              <Zap className="w-6 h-6 text-primary-foreground animate-pulse" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Zaplane
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-muted-foreground hover:text-accent transition-all duration-300 hover:scale-105 font-medium">
              Features
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-accent transition-all duration-300 hover:scale-105 font-medium">
              Pricing
            </a>
            <a href="/signin" className="text-muted-foreground hover:text-accent transition-all duration-300 hover:scale-105 font-medium">
              Sign In
            </a>
            <a href="/signup">
              <Button className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-accent-foreground shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-300 hover:scale-105">
                Get Started
              </Button>
            </a>
          </nav>
        </div>
      </header>

      <section className="py-24 px-6 relative z-10">
        <div className="container mx-auto text-center max-w-5xl">
          <Badge className="mb-6 bg-gradient-to-r from-accent/20 to-primary/20 text-accent border border-accent/30 px-4 py-2 animate-pulse shadow-lg shadow-accent/20">
            <Sparkles className="w-4 h-4 mr-2" />
            MVP Release
          </Badge>
          
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 text-balance leading-tight">
            Automate Your Workflows{" "}
            <span className="bg-gradient-to-r from-accent via-primary to-chart-2 bg-clip-text text-transparent animate-pulse">
              Effortlessly
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 text-pretty max-w-3xl mx-auto leading-relaxed">
            Connect Telegram, Email, and AI Agents in one powerful automation platform. Build workflows that work while
            you sleep and scale your productivity to new heights.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a href="/signup">
              <Button size="lg" className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-accent-foreground px-8 py-4 text-lg font-semibold shadow-2xl shadow-accent/30 hover:shadow-accent/50 transition-all duration-300 hover:scale-105 group">
                Start Automating 
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 px-6 bg-gradient-to-b from-transparent to-card/30 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <Badge className="mb-4 bg-primary/20 text-primary border border-primary/30 px-3 py-1">
              <Shield className="w-4 h-4 mr-2" />
              Enterprise Ready
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Powerful Automation Features
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Everything you need to automate your workflows and boost productivity beyond imagination
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <Card className="bg-gradient-to-br from-card/80 to-card/40 border border-border/30 hover:border-accent/50 transition-all duration-500 hover:scale-105 backdrop-blur-sm shadow-xl shadow-primary/5 hover:shadow-accent/20 group">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-accent/30 to-primary/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-accent/20">
                  <MessageCircle className="w-8 h-8 text-accent group-hover:animate-pulse" />
                </div>
                <CardTitle className="text-2xl text-card-foreground group-hover:text-accent transition-colors duration-300">
                  Telegram Integration
                </CardTitle>
                <CardDescription className="text-muted-foreground text-lg leading-relaxed">
                  Send messages, notifications, and alerts directly to Telegram channels and users with lightning speed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-center text-base group-hover:text-accent transition-colors duration-300">
                    <CheckCircle className="w-5 h-5 text-accent mr-3 flex-shrink-0" />
                    <span>Smart bot messaging with AI</span>
                  </li>
                  <li className="flex items-center text-base group-hover:text-accent transition-colors duration-300">
                    <CheckCircle className="w-5 h-5 text-accent mr-3 flex-shrink-0" />
                    <span>Real-time channel notifications</span>
                  </li>
                  <li className="flex items-center text-base group-hover:text-accent transition-colors duration-300">
                    <CheckCircle className="w-5 h-5 text-accent mr-3 flex-shrink-0" />
                    <span>Secure file sharing & media</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card/80 to-card/40 border border-border/30 hover:border-primary/50 transition-all duration-500 hover:scale-105 backdrop-blur-sm shadow-xl shadow-primary/5 hover:shadow-primary/20 group">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/30 to-chart-2/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/20">
                  <Mail className="w-8 h-8 text-primary group-hover:animate-pulse" />
                </div>
                <CardTitle className="text-2xl text-card-foreground group-hover:text-primary transition-colors duration-300">
                  Email Automation
                </CardTitle>
                <CardDescription className="text-muted-foreground text-lg leading-relaxed">
                  Automate email campaigns, notifications, and responses with intelligent triggers and personalization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-center text-base group-hover:text-primary transition-colors duration-300">
                    <CheckCircle className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                    <span>AI-powered smart templates</span>
                  </li>
                  <li className="flex items-center text-base group-hover:text-primary transition-colors duration-300">
                    <CheckCircle className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                    <span>Advanced trigger-based sending</span>
                  </li>
                  <li className="flex items-center text-base group-hover:text-primary transition-colors duration-300">
                    <CheckCircle className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                    <span>Real-time delivery analytics</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card/80 to-card/40 border border-border/30 hover:border-chart-2/50 transition-all duration-500 hover:scale-105 backdrop-blur-sm shadow-xl shadow-primary/5 hover:shadow-chart-2/20 group">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-chart-2/30 to-accent/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-chart-2/20">
                  <Bot className="w-8 h-8 text-chart-2 group-hover:animate-pulse" />
                </div>
                <CardTitle className="text-2xl text-card-foreground group-hover:text-chart-2 transition-colors duration-300">
                  AI Agents
                </CardTitle>
                <CardDescription className="text-muted-foreground text-lg leading-relaxed">
                  Deploy intelligent agents that make decisions, learn from data, and execute complex multi-step workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-center text-base group-hover:text-chart-2 transition-colors duration-300">
                    <CheckCircle className="w-5 h-5 text-chart-2 mr-3 flex-shrink-0" />
                    <span>Advanced decision making AI</span>
                  </li>
                  <li className="flex items-center text-base group-hover:text-chart-2 transition-colors duration-300">
                    <CheckCircle className="w-5 h-5 text-chart-2 mr-3 flex-shrink-0" />
                    <span>Natural language processing</span>
                  </li>
                  <li className="flex items-center text-base group-hover:text-chart-2 transition-colors duration-300">
                    <CheckCircle className="w-5 h-5 text-chart-2 mr-3 flex-shrink-0" />
                    <span>Custom model training</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5"></div>
        <div className="container mx-auto text-center relative z-10">
          <Card className="bg-gradient-to-br from-card/90 to-card/60 border border-border/40 max-w-3xl mx-auto backdrop-blur-lg shadow-2xl shadow-primary/10 hover:shadow-accent/20 transition-all duration-500 hover:scale-105">
            <CardHeader className="pb-6">
              <Badge className="mb-4 bg-gradient-to-r from-accent/20 to-primary/20 text-accent border border-accent/30 px-4 py-2 mx-auto w-fit">
                <Zap className="w-4 h-4 mr-2" />
                Start Your Journey
              </Badge>
              <CardTitle className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent mb-4">
                Ready to Automate?
              </CardTitle>
              <CardDescription className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                Join thousands of users who have revolutionized their workflows with our powerful automation platform
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/signup">
                  <Button size="lg" className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-accent-foreground px-10 py-4 text-lg font-semibold shadow-2xl shadow-accent/30 hover:shadow-accent/50 transition-all duration-300 hover:scale-105 group">
                    Get Started Now 
                    <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

    </div>
  )
}