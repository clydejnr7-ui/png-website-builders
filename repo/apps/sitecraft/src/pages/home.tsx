import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Globe, Code, Zap, LayoutTemplate, CheckCircle2, ArrowRight, Mail } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function HomePage() {
  const { user } = useAuth();
  const isSignedIn = !!user;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-lg border-b border-border shadow-sm shadow-blue-900/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
            <Globe className="w-6 h-6 text-primary" />
            <span>PNG Website Builders</span>
          </div>
          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <Link href="/dashboard/create">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
                  Go to Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground font-medium">Sign In</Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-md shadow-blue-900/20">
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 mesh-bg" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary font-medium mb-8"
          >
            <Zap className="w-4 h-4" />
            <span>Papua New Guinea's #1 AI Website Builder</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-extrabold tracking-tighter mb-6 text-foreground leading-tight"
          >
            Build your website<br />
            <span className="text-primary">in seconds</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            Describe your business and our AI builds a professional website instantly. No coding, no design skills needed.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href={isSignedIn ? "/dashboard/create" : "/sign-up"}>
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-lg h-14 px-8 shadow-xl shadow-blue-900/20">
                Start Building Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            {!isSignedIn && (
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="font-semibold text-lg h-14 px-8">
                  Sign In
                </Button>
              </Link>
            )}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-sm text-muted-foreground mt-4"
          >
            5 free website generations — no credit card required
          </motion.p>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-foreground mb-4">Everything you need to go online</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Built for businesses across Papua New Guinea</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "Instant Generation", desc: "Type your idea and get a complete website in under 30 seconds using advanced AI." },
              { icon: Code, title: "Clean HTML Code", desc: "Download the full HTML file and host it anywhere — your own server, cPanel, or free hosting." },
              { icon: LayoutTemplate, title: "Multiple Styles", desc: "Choose from modern, minimal, bold, or corporate styles to match your brand." },
            ].map((f) => (
              <div key={f.title} className="p-8 rounded-2xl border border-border bg-muted/30 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-foreground mb-4">Simple, transparent pricing</h2>
            <p className="text-muted-foreground text-lg">Start free, upgrade when you need more</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="p-8 rounded-2xl border border-border bg-white">
              <h3 className="text-2xl font-bold text-foreground mb-2">Free</h3>
              <div className="text-4xl font-extrabold text-foreground mb-1">$0</div>
              <p className="text-muted-foreground text-sm mb-6">Forever free</p>
              <ul className="space-y-3 mb-8 text-muted-foreground">
                <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> 5 free website generations</li>
                <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> Full HTML download</li>
                <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> Save sites to your account</li>
              </ul>
              <Link href="/sign-up">
                <Button className="w-full bg-muted hover:bg-muted/80 text-foreground border border-border font-medium">Get Started Free</Button>
              </Link>
            </div>
            <div className="p-8 rounded-2xl border-2 border-primary bg-white relative shadow-xl shadow-blue-900/15">
              <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-bl-lg rounded-tr-xl">MOST POPULAR</div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Pro Packs</h3>
              <div className="text-4xl font-extrabold text-foreground mb-1">From $10</div>
              <p className="text-muted-foreground text-sm mb-6">Pay once, use anytime</p>
              <ul className="space-y-3 mb-8 text-muted-foreground">
                <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> Buy 10, 25, or 50 credits</li>
                <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> Premium style templates</li>
                <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> Save unlimited sites</li>
                <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> Priority generation</li>
              </ul>
              <Link href="/sign-up">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-md shadow-blue-900/20">Upgrade Now</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-6 bg-primary">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">Ready to build your website?</h2>
          <p className="text-blue-100 text-lg mb-8">Join businesses across Papua New Guinea using AI to create professional websites in seconds.</p>
          <Link href={isSignedIn ? "/dashboard/create" : "/sign-up"}>
            <Button size="lg" className="bg-white text-primary hover:bg-blue-50 font-semibold text-lg h-14 px-10 shadow-xl">
              Start Building Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <div className="flex items-center gap-2 font-bold text-foreground text-lg mb-3">
                <Globe className="w-5 h-5 text-primary" />
                PNG Website Builders
              </div>
              <p className="text-muted-foreground text-sm max-w-xs">
                Papua New Guinea's leading AI-powered website builder. Professional results in seconds.
              </p>
              <a href="mailto:support@pngwebsitebuilders.site" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mt-3 transition-colors">
                <Mail className="w-4 h-4" />
                support@pngwebsitebuilders.site
              </a>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <div className="font-semibold text-foreground mb-3">Product</div>
                <ul className="space-y-2 text-muted-foreground">
                  <li><Link href="/sign-up" className="hover:text-primary transition-colors">Get Started</Link></li>
                  <li><Link href="/dashboard/credits" className="hover:text-primary transition-colors">Pricing</Link></li>
                </ul>
              </div>
              <div>
                <div className="font-semibold text-foreground mb-3">Support</div>
                <ul className="space-y-2 text-muted-foreground">
                  <li><a href="mailto:support@pngwebsitebuilders.site" className="hover:text-primary transition-colors">Contact Us</a></li>
                  <li><Link href="/sign-in" className="hover:text-primary transition-colors">Sign In</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} PNG Website Builders. All rights reserved.</p>
            <p>pngwebsitebuilders.site</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
