import Link from "next/link"
import { Zap, Github, Twitter, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">n8n MVP</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Powerful automation platform with Telegram, Email, and AI Agents integration.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Product</h3>
            <div className="space-y-2">
              <Link
                href="/#features"
                className="block text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                Features
              </Link>
              <Link
                href="/#pricing"
                className="block text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                Pricing
              </Link>
              <Link href="#" className="block text-sm text-muted-foreground hover:text-accent transition-colors">
                Documentation
              </Link>
              <Link href="#" className="block text-sm text-muted-foreground hover:text-accent transition-colors">
                API Reference
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Company</h3>
            <div className="space-y-2">
              <Link href="#" className="block text-sm text-muted-foreground hover:text-accent transition-colors">
                About Us
              </Link>
              <Link href="#" className="block text-sm text-muted-foreground hover:text-accent transition-colors">
                Blog
              </Link>
              <Link href="#" className="block text-sm text-muted-foreground hover:text-accent transition-colors">
                Careers
              </Link>
              <Link href="#" className="block text-sm text-muted-foreground hover:text-accent transition-colors">
                Contact
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Connect</h3>
            <div className="space-y-2">
              <Link href="#" className="block text-sm text-muted-foreground hover:text-accent transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="block text-sm text-muted-foreground hover:text-accent transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="block text-sm text-muted-foreground hover:text-accent transition-colors">
                Support
              </Link>
            </div>
            <div className="flex space-x-4 pt-2">
              <Link href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Github className="w-5 h-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Twitter className="w-5 h-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Mail className="w-5 h-5" />
                <span className="sr-only">Email</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">© {new Date().getUTCFullYear()} n8n MVP. All rights reserved.</p>
          <p className="text-sm text-muted-foreground mt-2 md:mt-0">Built with ❤️ for automation enthusiasts</p>
        </div>
      </div>
    </footer>
  )
}
