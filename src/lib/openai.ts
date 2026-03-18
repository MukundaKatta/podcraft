import OpenAI from "openai";
import type {
  HostConfig,
  DiscussionFormat,
  TranscriptSegment,
  Chapter,
  PodcastScript,
  ScriptLine,
} from "@/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const FORMAT_PROMPTS: Record<DiscussionFormat, string> = {
  interview: `Generate a podcast script in INTERVIEW format. One host interviews the other as a subject matter expert. The interviewer asks insightful questions, follows up on interesting points, and guides the conversation naturally. The expert provides detailed, engaging answers with real examples.`,
  debate: `Generate a podcast script in DEBATE format. The two hosts take opposing viewpoints on the topics from the source material. They should respectfully challenge each other's positions, present evidence, find common ground occasionally, and maintain intellectual rigor throughout.`,
  explainer: `Generate a podcast script in EXPLAINER format. One host is the knowledgeable explainer and the other is the curious learner. The explainer breaks down complex concepts into digestible pieces while the learner asks clarifying questions that the audience might have.`,
  qna: `Generate a podcast script in Q&A format. Structure the discussion as a series of audience-style questions about the source material. One host poses questions that listeners would naturally ask, and the other provides thorough, accessible answers.`,
};

export async function generatePodcastScript(
  documentContents: string[],
  format: DiscussionFormat,
  hostConfig: HostConfig,
  title: string
): Promise<PodcastScript> {
  const combinedContent = documentContents.join("\n\n---\n\n");
  const truncatedContent = combinedContent.slice(0, 30000);

  const systemPrompt = `You are an expert podcast script writer. ${FORMAT_PROMPTS[format]}

Host 1: ${hostConfig.host1.name} - ${hostConfig.host1.personality}. Speaking style: ${hostConfig.host1.speakingStyle}. Role: ${hostConfig.host1.role}. Expertise: ${hostConfig.host1.expertise.join(", ")}.

Host 2: ${hostConfig.host2.name} - ${hostConfig.host2.personality}. Speaking style: ${hostConfig.host2.speakingStyle}. Role: ${hostConfig.host2.role}. Expertise: ${hostConfig.host2.expertise.join(", ")}.

Create a natural, engaging podcast conversation. Break it into clear chapters. Each line of dialogue should feel authentic and conversational - not scripted or stiff. Include natural interjections, reactions, and transitions.

IMPORTANT: Return ONLY valid JSON matching this exact schema:
{
  "title": "Episode Title",
  "chapters": [
    {
      "title": "Chapter Title",
      "summary": "Brief chapter summary",
      "lines": [
        {
          "speaker": "Host Name",
          "text": "What they say",
          "emotion": "neutral|excited|thoughtful|amused|serious|surprised",
          "pauseAfter": 0.5
        }
      ]
    }
  ],
  "estimatedDuration": 600
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Create a podcast episode titled "${title}" based on this source material:\n\n${truncatedContent}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.8,
    max_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No script generated from OpenAI");
  }

  return JSON.parse(content) as PodcastScript;
}

export async function generateAudioForLine(
  text: string,
  voice: string,
  speed: number = 1.0
): Promise<Buffer> {
  const validVoices = [
    "alloy",
    "echo",
    "fable",
    "onyx",
    "nova",
    "shimmer",
  ] as const;
  const selectedVoice = validVoices.includes(voice as any)
    ? (voice as (typeof validVoices)[number])
    : "alloy";

  const response = await openai.audio.speech.create({
    model: "tts-1-hd",
    voice: selectedVoice,
    input: text,
    speed: Math.max(0.25, Math.min(4.0, speed)),
    response_format: "mp3",
  });

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function generateEpisodeAudio(
  script: PodcastScript,
  hostConfig: HostConfig,
  speed: number = 1.0
): Promise<{
  audioBuffers: Buffer[];
  segments: TranscriptSegment[];
  chapters: Chapter[];
}> {
  const audioBuffers: Buffer[] = [];
  const segments: TranscriptSegment[] = [];
  const chapters: Chapter[] = [];
  let currentTime = 0;

  for (const chapter of script.chapters) {
    const chapterStartTime = currentTime;
    const chapterId = crypto.randomUUID();

    for (const line of chapter.lines) {
      const voice =
        line.speaker === hostConfig.host1.name
          ? hostConfig.host1.voice
          : hostConfig.host2.voice;

      const audioBuffer = await generateAudioForLine(line.text, voice, speed);
      audioBuffers.push(audioBuffer);

      const estimatedDuration = (line.text.length / 15) * (1 / speed);
      const segmentId = crypto.randomUUID();

      segments.push({
        id: segmentId,
        speaker: line.speaker,
        text: line.text,
        startTime: currentTime,
        endTime: currentTime + estimatedDuration,
        chapterId,
      });

      currentTime += estimatedDuration;

      if (line.pauseAfter) {
        currentTime += line.pauseAfter;
      }
    }

    chapters.push({
      id: chapterId,
      title: chapter.title,
      startTime: chapterStartTime,
      endTime: currentTime,
      summary: chapter.summary,
    });
  }

  return { audioBuffers, segments, chapters };
}

export async function summarizeDocument(content: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content:
          "Summarize the following document content in 2-3 paragraphs, highlighting the key topics, arguments, and interesting points that would make good podcast discussion material.",
      },
      { role: "user", content: content.slice(0, 15000) },
    ],
    temperature: 0.3,
    max_tokens: 500,
  });

  return response.choices[0]?.message?.content || "No summary available.";
}
