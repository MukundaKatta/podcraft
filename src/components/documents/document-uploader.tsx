"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  Link as LinkIcon,
  Type,
  X,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { formatFileSize } from "@/lib/utils";
import type { UploadResponse } from "@/types";

interface DocumentUploaderProps {
  episodeId: string;
  onDocumentAdded: (doc: UploadResponse) => void;
}

interface UploadedDoc extends UploadResponse {
  uploading?: boolean;
}

export function DocumentUploader({
  episodeId,
  onDocumentAdded,
}: DocumentUploaderProps) {
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);

  const uploadFile = useCallback(
    async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("episode_id", episodeId);

      try {
        const response = await fetch("/api/documents", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Upload failed");
        }

        const doc: UploadResponse = await response.json();
        setDocuments((prev) => [...prev, doc]);
        onDocumentAdded(doc);
        toast({ title: "Document uploaded", description: `${doc.name} processed successfully` });
      } catch (err: any) {
        toast({
          title: "Upload failed",
          description: err.message,
          variant: "destructive",
        });
      }
    },
    [episodeId, onDocumentAdded]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true);
      for (const file of acceptedFiles) {
        await uploadFile(file);
      }
      setUploading(false);
    },
    [uploadFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "text/markdown": [".md"],
    },
    maxSize: 20 * 1024 * 1024, // 20MB
  });

  const handleUrlSubmit = async () => {
    if (!url.trim()) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("url", url);
    formData.append("episode_id", episodeId);

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to process URL");
      }

      const doc: UploadResponse = await response.json();
      setDocuments((prev) => [...prev, doc]);
      onDocumentAdded(doc);
      setUrl("");
      toast({ title: "URL processed", description: `${doc.wordCount} words extracted` });
    } catch (err: any) {
      toast({
        title: "URL processing failed",
        description: err.message,
        variant: "destructive",
      });
    }

    setUploading(false);
  };

  const handleTextSubmit = async () => {
    if (!text.trim()) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("text", text);
    formData.append("episode_id", episodeId);

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to process text");
      }

      const doc: UploadResponse = await response.json();
      setDocuments((prev) => [...prev, doc]);
      onDocumentAdded(doc);
      setText("");
      toast({ title: "Text processed", description: `${doc.wordCount} words analyzed` });
    } catch (err: any) {
      toast({
        title: "Text processing failed",
        description: err.message,
        variant: "destructive",
      });
    }

    setUploading(false);
  };

  const removeDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.documentId !== docId));
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="upload">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            From URL
          </TabsTrigger>
          <TabsTrigger value="text" className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            Paste Text
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Processing document...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Upload className="w-10 h-10 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {isDragActive ? "Drop files here" : "Drag & drop files here"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    PDF, TXT, MD files up to 20MB
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Browse Files
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="url">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={uploading}
              />
              <Button onClick={handleUrlSubmit} disabled={uploading || !url.trim()}>
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Process"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              We will extract the main content from any web page
            </p>
          </div>
        </TabsContent>

        <TabsContent value="text">
          <div className="space-y-3">
            <Textarea
              placeholder="Paste or type your content here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              disabled={uploading}
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                {text.trim().split(/\s+/).filter(Boolean).length} words
              </p>
              <Button onClick={handleTextSubmit} disabled={uploading || !text.trim()}>
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Process Text"
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Document list */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Source Documents ({documents.length})
          </p>
          {documents.map((doc) => (
            <Card key={doc.documentId}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.wordCount.toLocaleString()} words
                  </p>
                </div>
                <Badge variant="secondary">{doc.type}</Badge>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <button
                  onClick={() => removeDocument(doc.documentId)}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
