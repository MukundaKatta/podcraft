import type { FormatPreset, HostConfig } from "@/types";

const defaultInterviewHosts: HostConfig = {
  host1: {
    name: "Alex Rivera",
    role: "interviewer",
    voice: "alloy",
    personality: "Curious, warm, and insightful. Asks probing follow-up questions.",
    speakingStyle: "Conversational and encouraging, with natural pauses for reflection.",
    expertise: ["journalism", "storytelling", "communication"],
  },
  host2: {
    name: "Dr. Jordan Chen",
    role: "expert",
    voice: "onyx",
    personality: "Knowledgeable, articulate, and passionate about sharing expertise.",
    speakingStyle: "Clear and authoritative, with relatable analogies and examples.",
    expertise: ["research", "analysis", "education"],
  },
};

const defaultDebateHosts: HostConfig = {
  host1: {
    name: "Sam Torres",
    role: "moderator",
    voice: "echo",
    personality: "Thoughtful progressive thinker who values evidence and nuance.",
    speakingStyle: "Measured and articulate, builds arguments methodically.",
    expertise: ["policy", "ethics", "social science"],
  },
  host2: {
    name: "Morgan Blake",
    role: "guest",
    voice: "nova",
    personality: "Pragmatic contrarian who challenges assumptions with data.",
    speakingStyle: "Direct and energetic, uses concrete examples and statistics.",
    expertise: ["economics", "technology", "strategy"],
  },
};

const defaultExplainerHosts: HostConfig = {
  host1: {
    name: "Professor Lee",
    role: "expert",
    voice: "fable",
    personality: "Patient, clear, and loves making complex topics accessible.",
    speakingStyle: "Structured explanations with step-by-step breakdowns and analogies.",
    expertise: ["education", "science", "technology"],
  },
  host2: {
    name: "Jamie Park",
    role: "host",
    voice: "shimmer",
    personality: "Genuinely curious, represents the audience perspective.",
    speakingStyle: "Enthusiastic and relatable, asks the questions listeners are thinking.",
    expertise: ["communication", "audience engagement"],
  },
};

const defaultQnAHosts: HostConfig = {
  host1: {
    name: "Riley Quinn",
    role: "host",
    voice: "alloy",
    personality: "Organized, thorough, collects and curates audience questions.",
    speakingStyle: "Clear and structured, excellent at framing questions for maximum clarity.",
    expertise: ["research", "audience engagement", "curation"],
  },
  host2: {
    name: "Dr. Avery Kim",
    role: "expert",
    voice: "onyx",
    personality: "Deep subject matter expert who gives thorough, practical answers.",
    speakingStyle: "Detailed but accessible, always provides actionable takeaways.",
    expertise: ["subject matter expertise", "research", "consulting"],
  },
};

export const FORMAT_PRESETS: FormatPreset[] = [
  {
    id: "interview",
    name: "Interview",
    description: "One host interviews an expert on the topic. Great for deep dives into specific subjects.",
    icon: "mic",
    defaultHostConfig: defaultInterviewHosts,
    systemPrompt: "Create an engaging interview-style conversation with natural follow-up questions.",
  },
  {
    id: "debate",
    name: "Debate",
    description: "Two hosts take opposing viewpoints. Perfect for controversial or nuanced topics.",
    icon: "swords",
    defaultHostConfig: defaultDebateHosts,
    systemPrompt: "Create a respectful but spirited debate with well-reasoned arguments on both sides.",
  },
  {
    id: "explainer",
    name: "Explainer",
    description: "An expert breaks down complex topics for a curious co-host. Ideal for educational content.",
    icon: "lightbulb",
    defaultHostConfig: defaultExplainerHosts,
    systemPrompt: "Create a clear, educational conversation that progressively builds understanding.",
  },
  {
    id: "qna",
    name: "Q&A",
    description: "Audience-style questions answered by an expert. Great for comprehensive topic coverage.",
    icon: "helpCircle",
    defaultHostConfig: defaultQnAHosts,
    systemPrompt: "Create a thorough Q&A session covering the most important questions from the material.",
  },
];

export function getFormatPreset(formatId: string): FormatPreset {
  return FORMAT_PRESETS.find((f) => f.id === formatId) || FORMAT_PRESETS[0];
}
