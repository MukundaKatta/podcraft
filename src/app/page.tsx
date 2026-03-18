"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mic2,
  FileText,
  Users,
  Headphones,
  BarChart3,
  Rss,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: FileText,
    title: "Document to Podcast",
    description:
      "Upload PDFs, paste URLs, or type text. Our AI transforms any content into engaging audio discussions.",
  },
  {
    icon: Users,
    title: "Host Personalities",
    description:
      "Choose from distinct AI host personalities with unique voices, speaking styles, and expertise areas.",
  },
  {
    icon: Mic2,
    title: "Discussion Formats",
    description:
      "Interview, debate, explainer, or Q&A -- pick the format that best suits your content.",
  },
  {
    icon: Headphones,
    title: "Chapter Markers & Transcript",
    description:
      "Auto-generated chapters and synchronized transcripts make your podcasts accessible and navigable.",
  },
  {
    icon: Rss,
    title: "RSS Feed Generator",
    description:
      "Publish your series with auto-generated RSS feeds compatible with all major podcast platforms.",
  },
  {
    icon: BarChart3,
    title: "Listener Analytics",
    description:
      "Track plays, downloads, listener retention, and engagement with detailed analytics dashboards.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-podcast-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-white/60 dark:bg-gray-950/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-podcast flex items-center justify-center">
                <Mic2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">PodCraft</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/dashboard/episodes">
                <Button>
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-podcast-50 dark:bg-podcast-900/20 text-podcast-600 dark:text-podcast-400 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            AI-Powered Podcast Generation
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6">
            Documents become
            <span className="block gradient-podcast bg-clip-text text-transparent">
              podcasts in minutes
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Upload any document and PodCraft creates a professional podcast
            episode with AI hosts, natural discussions, chapter markers, and
            synchronized transcripts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard/episodes">
              <Button size="lg" className="text-lg px-8 py-6 gradient-podcast border-0 text-white hover:opacity-90">
                <Mic2 className="mr-2 w-5 h-5" />
                Create Your First Episode
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                View Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Waveform decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex items-end justify-center gap-1 mt-16 h-20"
        >
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="waveform-bar active"
              style={{
                height: `${20 + Math.sin(i * 0.5) * 30 + Math.random() * 20}%`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Everything you need to create AI podcasts</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From document upload to published RSS feed, PodCraft handles the entire podcast creation pipeline.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
              className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-lg gradient-podcast flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 rounded gradient-podcast flex items-center justify-center">
              <Mic2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-foreground">PodCraft</span>
          </div>
          <p>AI-powered podcast generation platform</p>
        </div>
      </footer>
    </div>
  );
}
