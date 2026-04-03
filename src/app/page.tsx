"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  BellRing, 
  MessageCircle, 
  Users, 
  LineChart, 
  CheckCircle2, 
  ShieldCheck,
  Mail,
  Heart,
  Menu,
  X,
  Pill,
  Clock,
  TrendingUp,
  Sparkles
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const features = [
    {
      icon: <BellRing className="w-7 h-7" />,
      title: "Smart Reminders",
      description: "Receive timely push notifications exactly when you need to take your medication. Never miss a dose.",
      gradient: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50 dark:bg-blue-950/30"
    },
    {
      icon: <MessageCircle className="w-7 h-7" />,
      title: "WhatsApp Alerts",
      description: "Get reminders sent straight to your WhatsApp. Your caregivers stay informed too.",
      gradient: "from-green-500 to-emerald-600",
      bg: "bg-green-50 dark:bg-green-950/30"
    },
    {
      icon: <Users className="w-7 h-7" />,
      title: "Guardian Notifications",
      description: "Automatically notify your healthcare providers and loved ones when doses are missed.",
      gradient: "from-purple-500 to-violet-600",
      bg: "bg-purple-50 dark:bg-purple-950/30"
    },
    {
      icon: <LineChart className="w-7 h-7" />,
      title: "Progress Tracking",
      description: "Visualize your adherence over time with intuitive charts and streak tracking.",
      gradient: "from-amber-500 to-orange-600",
      bg: "bg-amber-50 dark:bg-amber-950/30"
    }
  ];

  const steps = [
    {
      title: "Add your medication",
      description: "Input your prescriptions, dosage, and schedule in seconds. We support daily, weekly, and custom schedules.",
      icon: <Pill className="w-5 h-5" />
    },
    {
      title: "Get notified on time",
      description: "Receive smart reminders via push notifications and WhatsApp when it's time to take your meds.",
      icon: <Clock className="w-5 h-5" />
    },
    {
      title: "Track & improve",
      description: "Build healthy habits with streak tracking, adherence charts, and shareable reports for your doctor.",
      icon: <TrendingUp className="w-5 h-5" />
    }
  ];

  const testimonials = [
    {
      quote: "MedTrack gives me peace of mind. I can see if my mother took her blood pressure medication — and get a WhatsApp alert if she didn't.",
      author: "Priya S.",
      role: "Caregiver",
      initials: "PS",
      gradientFrom: "from-pink-500",
      gradientTo: "to-rose-500"
    },
    {
      quote: "The streak tracking is genuinely motivating. I've been consistent with my meds for 45 days straight — a personal record.",
      author: "Rahul M.",
      role: "Patient",
      initials: "RM",
      gradientFrom: "from-blue-500",
      gradientTo: "to-indigo-500"
    },
    {
      quote: "Simple, focused, and well-designed. I recommend it to patients who struggle with multi-drug regimens.",
      author: "Dr. Ananya K.",
      role: "Physician",
      initials: "AK",
      gradientFrom: "from-emerald-500",
      gradientTo: "to-teal-500"
    }
  ];

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How it Works" },
    { href: "#testimonials", label: "Testimonials" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      {/* Navbar */}
      <header className="px-6 py-4 fixed top-0 w-full z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
              <Image src="/medtrack_logo.png" alt="MedTrack Logo" width={36} height={36} className="object-cover" />
            </div>
            <span className="text-xl font-bold tracking-tight">MedTrack</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="hover:text-primary transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden md:block text-sm font-medium hover:text-primary transition-colors">
              Log in
            </Link>
            <Link 
              href="/signup" 
              className="hidden sm:inline-flex bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 rounded-full text-sm font-medium transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5"
            >
              Get Started
            </Link>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-secondary transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 right-0 z-50 w-72 bg-card border-l border-border p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-lg font-bold">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-1">
                {navLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-xl text-foreground font-medium hover:bg-secondary transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto pt-6 border-t border-border space-y-3">
                <Link 
                  href="/login" 
                  className="block w-full text-center py-3 rounded-xl border border-border font-medium hover:bg-secondary transition-colors"
                >
                  Log in
                </Link>
                <Link 
                  href="/signup" 
                  className="block w-full text-center py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/25"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="pt-28 pb-16 md:pt-44 md:pb-28 px-6 relative overflow-hidden">
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
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8 border border-primary/20">
              <Sparkles className="w-4 h-4" />
              <span>Free to use — Open Source</span>
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
              Medication tracking <br className="hidden md:block" />
              <span className="gradient-text">made simple.</span>
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Never miss a dose again. Manage prescriptions, get smart reminders 
              via WhatsApp, and share progress with your doctor — all in one place.
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
            
            <motion.div variants={fadeIn} className="mt-10 text-sm text-muted-foreground flex flex-wrap items-center justify-center gap-6">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /> No credit card required</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /> Setup in 2 minutes</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /> 100% private</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Everything you need to stay on track</h2>
            <p className="text-lg text-muted-foreground">Designed for patients, caregivers, and doctors who need a reliable, simple medication management tool.</p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative rounded-2xl bg-card border border-border p-7 card-hover overflow-hidden"
              >
                {/* Gradient accent strip at top */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-70 group-hover:opacity-100 transition-opacity`} />
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-5`}>
                  <div className={`bg-gradient-to-br ${feature.gradient} bg-clip-text`}>
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 bg-secondary/30 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Get started in 3 simple steps</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">Set up your routine once, and let MedTrack handle the rest.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative text-center"
              >
                {/* Step number */}
                <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl mx-auto mb-5 shadow-lg shadow-primary/25">
                  {index + 1}
                </div>
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-border" />
                )}
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Your health at a glance</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">A clean, intuitive dashboard that shows you exactly what matters.</p>
          </motion.div>

          {/* Realistic Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
              {/* Fake browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/60" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/60" />
                  <div className="w-3 h-3 rounded-full bg-green-400/60" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="w-full max-w-md mx-auto h-7 rounded-lg bg-secondary/80 flex items-center justify-center text-xs text-muted-foreground">
                    medtrack.app/dashboard
                  </div>
                </div>
              </div>
              {/* Dashboard content preview */}
              <div className="p-6 md:p-8 space-y-6">
                {/* Greeting */}
                <div>
                  <div className="text-lg font-semibold text-foreground">Good morning, Priya 👋</div>
                  <div className="text-sm text-muted-foreground">Friday, April 4, 2026</div>
                </div>
                {/* Stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Active Meds", value: "4", color: "from-indigo-500 to-purple-500", bg: "bg-indigo-50 dark:bg-indigo-950/30", text: "text-indigo-600 dark:text-indigo-400", icon: Pill },
                    { label: "Taken Today", value: "3", color: "from-emerald-500 to-teal-500", bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-600 dark:text-emerald-400", icon: CheckCircle2 },
                    { label: "Missed Today", value: "0", color: "from-red-500 to-rose-500", bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-600 dark:text-red-400", icon: ShieldCheck },
                    { label: "Adherence", value: "94%", color: "from-amber-500 to-orange-500", bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-600 dark:text-amber-400", icon: TrendingUp },
                  ].map((card) => (
                    <div key={card.label} className="relative overflow-hidden rounded-xl bg-card border border-border p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
                          <p className="text-2xl font-bold text-foreground mt-1">{card.value}</p>
                        </div>
                        <div className={`p-2 rounded-lg ${card.bg}`}>
                          <card.icon className={`w-4 h-4 ${card.text}`} />
                        </div>
                      </div>
                      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color} opacity-70`} />
                    </div>
                  ))}
                </div>
                {/* Today's schedule preview */}
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-sm">Today&apos;s Schedule</span>
                    </div>
                    <span className="text-xs text-muted-foreground">3 of 4 completed</span>
                  </div>
                  {[
                    { name: "Metformin 500mg", time: "8:00 AM", status: "taken" },
                    { name: "Lisinopril 10mg", time: "8:00 AM", status: "taken" },
                    { name: "Atorvastatin 20mg", time: "9:00 PM", status: "taken" },
                    { name: "Aspirin 75mg", time: "10:00 PM", status: "pending" },
                  ].map((med) => (
                    <div key={med.name} className={`flex items-center justify-between px-4 py-3 border-b last:border-b-0 border-border ${med.status === "taken" ? "bg-success/5" : ""}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${med.status === "taken" ? "bg-success/10" : "bg-primary/10"}`}>
                          {med.status === "taken" ? (
                            <CheckCircle2 className="w-4 h-4 text-success" />
                          ) : (
                            <Clock className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{med.name}</p>
                          <p className="text-xs text-muted-foreground">{med.time}</p>
                        </div>
                      </div>
                      {med.status === "taken" ? (
                        <span className="text-xs font-medium text-success px-2 py-1 bg-success/10 rounded-lg">✓ Taken</span>
                      ) : (
                        <div className="flex gap-1.5">
                          <span className="text-xs font-medium text-success px-2.5 py-1 bg-success/10 rounded-lg cursor-default">Take</span>
                          <span className="text-xs font-medium text-destructive px-2.5 py-1 bg-destructive/10 rounded-lg cursor-default">Skip</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-8 -right-8 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-warning/10 rounded-full blur-3xl -z-10" />
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-secondary/30 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">What our users say</h2>
            <p className="text-lg text-muted-foreground">Real feedback from patients, caregivers, and doctors.</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((test, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card p-7 rounded-2xl border border-border flex flex-col card-hover"
              >
                <div className="flex gap-1 mb-5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-4 h-4 text-warning fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-foreground mb-6 flex-1 leading-relaxed">&ldquo;{test.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${test.gradientFrom} ${test.gradientTo} flex items-center justify-center text-white text-sm font-bold`}>
                    {test.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{test.author}</p>
                    <p className="text-xs text-muted-foreground">{test.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background -z-10" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/15 rounded-t-full blur-3xl -z-10" />
        
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-success/10 text-success text-sm font-semibold mb-6 border border-success/20">
              <Heart className="w-4 h-4 fill-current" />
              <span>Your health matters</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Ready to take control of<br className="hidden sm:block" /> your medication?</h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-lg mx-auto">
              Join patients and caregivers who use MedTrack to build healthier, more consistent habits.
            </p>
            <Link 
              href="/signup" 
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-10 py-5 rounded-full text-xl font-semibold hover:bg-primary/95 transition-all shadow-2xl shadow-primary/40 hover:-translate-y-1 hover:scale-105"
            >
              Get Started — It&apos;s Free
              <ArrowRight className="w-6 h-6" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer — only real links */}
      <footer className="border-t border-border bg-card pb-12 pt-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl overflow-hidden">
                  <Image src="/medtrack_logo.png" alt="MedTrack Logo" width={32} height={32} className="object-cover" />
                </div>
                <span className="text-xl font-bold tracking-tight">MedTrack</span>
              </Link>
              <p className="text-muted-foreground text-sm mb-6">
                Simplifying medication management for healthier, more consistent lives.
              </p>
              <div className="flex gap-4">
                <Link href="mailto:hello@medtrack.app" className="text-muted-foreground hover:text-primary transition-colors">
                  <Mail className="w-5 h-5" />
                  <span className="sr-only">Email</span>
                </Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-muted-foreground text-sm">
                <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="#how-it-works" className="hover:text-primary transition-colors">How it Works</Link></li>
                <li><Link href="#testimonials" className="hover:text-primary transition-colors">Testimonials</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Account</h4>
              <ul className="space-y-3 text-muted-foreground text-sm">
                <li><Link href="/login" className="hover:text-primary transition-colors">Log In</Link></li>
                <li><Link href="/signup" className="hover:text-primary transition-colors">Create Account</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground gap-4">
            <p>© {new Date().getFullYear()} MedTrack. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-destructive fill-current" /> by the MedTrack Team
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
