"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/Button";

const MAX_DURATION_MS = 60 * 1000; // 60 seconds

type Props = {
  onUpload: (blob: Blob) => Promise<void>;
  onCancel?: () => void;
};

export function VideoRecorder({ onUpload, onCancel }: Props) {
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (chunksRef.current.length) {
          setRecordedBlob(new Blob(chunksRef.current, { type: "video/webm" }));
        }
      };
      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setRecording(true);
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
          setRecording(false);
        }
      }, MAX_DURATION_MS);
    } catch {
      setError("Camera/microphone access is needed to record.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }, []);

  const handleUpload = async () => {
    if (!recordedBlob) return;
    setUploading(true);
    setError("");
    try {
      await onUpload(recordedBlob);
      setRecordedBlob(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-400">{error}</p>}
      {!recordedBlob ? (
        <>
          <p className="text-sm text-[var(--text-muted)]">Record a short intro (up to 60 seconds).</p>
          <div className="flex gap-2">
            {!recording ? (
              <Button onClick={startRecording}>Start recording</Button>
            ) : (
              <Button onClick={stopRecording} variant="secondary">
                Stop recording
              </Button>
            )}
            {onCancel && <Button variant="ghost" onClick={onCancel}>Cancel</Button>}
          </div>
        </>
      ) : (
        <>
          <video
            src={URL.createObjectURL(recordedBlob)}
            controls
            className="w-full max-w-md rounded-lg border border-[var(--border)]"
            playsInline
          />
          <div className="flex gap-2">
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? "Uploading…" : "Save video"}
            </Button>
            <Button variant="secondary" onClick={() => setRecordedBlob(null)} disabled={uploading}>
              Record again
            </Button>
            {onCancel && <Button variant="ghost" onClick={onCancel}>Cancel</Button>}
          </div>
        </>
      )}
    </div>
  );
}
