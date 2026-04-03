"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  BellRing, 
  MessageCircle, 
  Users, 
  LineChart, 
  CheckCircle2, 
  ShieldCheck,
  Instagram,
  Twitter,
  Mail,
  Heart
} from "lucide-react";

export default function LandingPage() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const features = [
    {
      icon: <BellRing className="w-8 h-8 text-primary" />,
      title: "Smart Reminders",
      description: "Receive timely push notifications exactly when you need to take your medication."
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-primary" />,
      title: "WhatsApp Alerts",
      description: "Get reminders sent straight to your WhatsApp for you and your caregivers."
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Guardian Notifications",
      description: "Keep your healthcare providers and loved ones in the loop automatically."
    },
    {
      icon: <LineChart className="w-8 h-8 text-primary" />,
      title: "Progress Tracking",
      description: "Visualize your adherence over time with comprehensive, easy-to-read charts."
    }
  ];

  const steps = [
    {
      title: "Add your medication",
      description: "Input your prescriptions, dosage, and schedule in seconds."
    },
    {
      title: "Get notified",
      description: "We'll remind you when it's time, so you never miss a dose."
    },
    {
      title: "Stay consistent",
      description: "Build healthy habits and share progress with your doctor."
    }
  ];

  const testimonials = [
    {
      quote: "MedTrack completely changed how I manage my parents' medications. It gives me peace of mind knowing they get WhatsApp alerts.",
      author: "Sarah J.",
      role: "Caregiver"
    },
    {
      quote: "The interface is so clean and simple. I especially love the streak tracking—it actually makes remembering fun.",
      author: "Michael T.",
      role: "Patient"
    },
    {
      quote: "As a doctor, I recommend MedTrack to all my chronic care patients. Adherence rates have noticeably improved.",
      author: "Dr. Emily R.",
      role: "Physician"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      {/* Navbar segment */}
      <header className="px-6 py-4 fixed top-0 w-full z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-primary-light flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight">MedTrack</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-primary transition-colors">How it Works</Link>
            <Link href="#testimonials" className="hover:text-primary transition-colors">Testimonials</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden md:block text-sm font-medium hover:text-primary transition-colors">
              Log in
            </Link>
            <Link 
              href="/signup" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 rounded-full text-sm font-medium transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-6 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute top-20 left-10 w-32 h-32 bg-secondary/30 rounded-full blur-xl -z-10 animate-float" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-primary/10 rounded-full blur-xl -z-10 animate-float-delayed" />

        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-8 border border-border">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Trusted by 10,000+ users</span>
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
              Medication tracking <br className="hidden md:block" />
              <span className="gradient-text">made simple.</span>
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Never miss a dose again. Securely manage your prescriptions, get smart reminders via WhatsApp, and share your progress seamlessly.
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/signup" 
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold hover:bg-primary/95 transition-all shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1"
              >
                Start for free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="#how-it-works" 
                className="w-full sm:w-auto flex items-center justify-center px-8 py-4 rounded-full text-lg font-medium border border-border hover:bg-secondary transition-colors"
              >
                See how it works
              </Link>
            </motion.div>
            
            <motion.div variants={fadeIn} className="mt-10 text-sm text-muted-foreground flex items-center justify-center gap-6">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /> No credit card required</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /> Setup in 2 minutes</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-secondary/50 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Everything you need to stay on track</h2>
            <p className="text-lg text-muted-foreground">We've thought of everything to make managing your medication effortless and reliable.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card card-hover p-8 rounded-2xl"
              >
                <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">It's as easy as<br />1-2-3</h2>
                <p className="text-lg text-muted-foreground mb-10">
                  We designed MedTrack to get out of your way. Set up your routine once, and let our system handle the rest.
                </p>
                
                <div className="space-y-8">
                  {steps.map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shrink-0 z-10">
                          {index + 1}
                        </div>
                        {index < steps.length - 1 && (
                          <div className="w-px h-full bg-border mt-2" />
                        )}
                      </div>
                      <div className="pb-8">
                        <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
            
            <div className="w-full lg:w-1/2 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-md mx-auto aspect-[9/18] rounded-[2.5rem] border-8 border-slate-800 bg-background overflow-hidden shadow-2xl"
              >
                {/* Mockup Screen */}
                <div className="w-full h-full flex flex-col pt-12 px-6 bg-secondary/20">
                  <div className="w-full bg-card rounded-2xl p-4 shadow-sm mb-4 border border-border animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="w-24 h-4 bg-muted animate-pulse rounded" />
                      <div className="w-8 h-4 bg-primary/20 rounded" />
                    </div>
                    <div className="w-32 h-6 bg-muted animate-pulse rounded mb-4" />
                    <div className="w-full h-10 bg-primary/10 rounded-xl" />
                  </div>
                  <div className="w-full bg-card rounded-2xl p-4 shadow-sm mb-4 border border-border animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="w-20 h-4 bg-muted animate-pulse rounded" />
                      <div className="w-8 h-4 bg-warning/20 rounded" />
                    </div>
                    <div className="w-36 h-6 bg-muted animate-pulse rounded mb-4" />
                    <div className="w-full h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground text-xs font-semibold">
                      Take med now
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Decorative blobs */}
              <div className="absolute top-1/4 -right-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-warning/20 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Loved by people like you</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((test, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-secondary/30 p-8 rounded-2xl border border-border"
              >
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-warning fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-lg text-foreground mb-6 italic">"{test.quote}"</p>
                <div>
                  <p className="font-semibold">{test.author}</p>
                  <p className="text-sm text-muted-foreground">{test.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/20 rounded-t-full blur-3xl -z-10" />
        
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Ready to take control?</h2>
            <p className="text-xl text-muted-foreground mb-10">
              Join thousands of users who trust MedTrack with their health routine.
            </p>
            <Link 
              href="/signup" 
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-10 py-5 rounded-full text-xl font-semibold hover:bg-primary/95 transition-all shadow-2xl shadow-primary/40 hover:-translate-y-1 hover:scale-105"
            >
              Get Started Now
              <ArrowRight className="w-6 h-6" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card pb-12 pt-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <span className="text-xl font-bold tracking-tight">MedTrack</span>
              </div>
              <p className="text-muted-foreground mb-6">
                Simplifying medication management for healthier, longer lives.
              </p>
              <div className="flex gap-4">
                <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Instagram className="w-5 h-5" />
                  <span className="sr-only">Instagram</span>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="w-5 h-5" />
                  <span className="sr-only">Twitter</span>
                </Link>
                <Link href="mailto:hello@medtrack.com" className="text-muted-foreground hover:text-primary transition-colors">
                  <Mail className="w-5 h-5" />
                  <span className="sr-only">Email</span>
                </Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="#how-it-works" className="hover:text-primary transition-colors">How it Works</Link></li>
                <li><Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground gap-4">
            <p>© {new Date().getFullYear()} MedTrack Inc. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-destructive fill-current" /> by the MedTrack Team
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

