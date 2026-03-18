import type { ID3Tags } from "@/types";

export function concatenateAudioBuffers(buffers: Buffer[]): Buffer {
  if (buffers.length === 0) return Buffer.alloc(0);
  if (buffers.length === 1) return buffers[0];

  const silenceGap = createSilenceBuffer(300);
  const parts: Buffer[] = [];

  for (let i = 0; i < buffers.length; i++) {
    parts.push(buffers[i]);
    if (i < buffers.length - 1) {
      parts.push(silenceGap);
    }
  }

  return Buffer.concat(parts);
}

function createSilenceBuffer(durationMs: number): Buffer {
  const sampleRate = 44100;
  const numSamples = Math.floor((sampleRate * durationMs) / 1000);
  const bytesPerSample = 2;
  const numChannels = 2;
  const dataSize = numSamples * bytesPerSample * numChannels;

  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28);
  header.writeUInt16LE(numChannels * bytesPerSample, 32);
  header.writeUInt16LE(bytesPerSample * 8, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  const silence = Buffer.alloc(dataSize, 0);
  return Buffer.concat([header, silence]);
}

export function writeID3Tags(audioBuffer: Buffer, tags: ID3Tags): Buffer {
  const frames: Buffer[] = [];

  const textFrames: [string, string][] = [
    ["TIT2", tags.title],
    ["TPE1", tags.artist],
    ["TALB", tags.album],
    ["TDRC", tags.year.toString()],
    ["TCON", tags.genre],
    ["TRCK", tags.trackNumber.toString()],
  ];

  for (const [id, value] of textFrames) {
    if (value) {
      const encoded = Buffer.from(value, "utf-8");
      const frameSize = encoded.length + 1;
      const frame = Buffer.alloc(10 + frameSize);
      frame.write(id, 0);
      frame.writeUInt32BE(frameSize, 4);
      frame.writeUInt16BE(0, 8);
      frame.writeUInt8(3, 10);
      encoded.copy(frame, 11);
      frames.push(frame);
    }
  }

  if (tags.comment) {
    const commentText = Buffer.from(tags.comment, "utf-8");
    const frameSize = 4 + commentText.length + 1;
    const frame = Buffer.alloc(10 + frameSize);
    frame.write("COMM", 0);
    frame.writeUInt32BE(frameSize, 4);
    frame.writeUInt16BE(0, 8);
    frame.writeUInt8(3, 10);
    frame.write("eng", 11);
    frame.writeUInt8(0, 14);
    commentText.copy(frame, 15);
    frames.push(frame);
  }

  if (tags.image) {
    const mimeBuffer = Buffer.from(tags.image.mime, "utf-8");
    const imageData = Buffer.from(tags.image.data);
    const frameSize = 1 + mimeBuffer.length + 1 + 1 + 1 + imageData.length;
    const frame = Buffer.alloc(10 + frameSize);
    frame.write("APIC", 0);
    frame.writeUInt32BE(frameSize, 4);
    frame.writeUInt16BE(0, 8);
    let offset = 10;
    frame.writeUInt8(0, offset++);
    mimeBuffer.copy(frame, offset);
    offset += mimeBuffer.length;
    frame.writeUInt8(0, offset++);
    frame.writeUInt8(3, offset++);
    frame.writeUInt8(0, offset++);
    imageData.copy(frame, offset);
    frames.push(frame);
  }

  const framesBuffer = Buffer.concat(frames);
  const tagSize = framesBuffer.length;

  const id3Header = Buffer.alloc(10);
  id3Header.write("ID3", 0);
  id3Header.writeUInt8(3, 3);
  id3Header.writeUInt8(0, 4);
  id3Header.writeUInt8(0, 5);
  id3Header.writeUInt8((tagSize >> 21) & 0x7f, 6);
  id3Header.writeUInt8((tagSize >> 14) & 0x7f, 7);
  id3Header.writeUInt8((tagSize >> 7) & 0x7f, 8);
  id3Header.writeUInt8(tagSize & 0x7f, 9);

  let audioStart = 0;
  if (
    audioBuffer[0] === 0x49 &&
    audioBuffer[1] === 0x44 &&
    audioBuffer[2] === 0x33
  ) {
    const existingSize =
      ((audioBuffer[6] & 0x7f) << 21) |
      ((audioBuffer[7] & 0x7f) << 14) |
      ((audioBuffer[8] & 0x7f) << 7) |
      (audioBuffer[9] & 0x7f);
    audioStart = 10 + existingSize;
  }

  return Buffer.concat([
    id3Header,
    framesBuffer,
    audioBuffer.subarray(audioStart),
  ]);
}

export function estimateAudioDuration(textLength: number, speed: number): number {
  const wordsPerMinute = 150 * speed;
  const estimatedWords = textLength / 5;
  return (estimatedWords / wordsPerMinute) * 60;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}
