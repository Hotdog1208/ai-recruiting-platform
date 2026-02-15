"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  generateInterviewQuestions,
  evaluateAnswer,
} from "@/lib/interview";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function InterviewSimulator() {
  const { session } = useAuth();
  const token = session?.access_token ?? null;
  const [role, setRole] = useState("Software Engineer");
  const [questions, setQuestions] = useState<string[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  const startSession = async () => {
    if (!token) return;
    setLoadingQuestions(true);
    setFeedback(null);
    setAnswer("");
    setCurrentIndex(0);
    try {
      const res = await generateInterviewQuestions(role, token);
      setQuestions(res.questions || []);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const submitAnswer = async () => {
    const q = questions[currentIndex];
    if (!q || !answer.trim() || !token) return;
    setEvaluating(true);
    setFeedback(null);
    try {
      const res = await evaluateAnswer(q, answer.trim(), token);
      setFeedback(res.feedback || "No feedback generated.");
    } finally {
      setEvaluating(false);
    }
  };

  if (questions.length === 0 && !loadingQuestions) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[var(--text)] mb-2">Interview practice</h3>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Get AI-generated questions for your target role and receive feedback on your answers.
        </p>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="min-w-[200px]">
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Job role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Software Engineer"
              className="w-full min-h-[2.5rem] px-4 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)]"
            />
          </div>
          <Button onClick={startSession} disabled={loadingQuestions}>
            {loadingQuestions ? "Generating…" : "Start practice"}
          </Button>
        </div>
      </Card>
    );
  }

  if (loadingQuestions) {
    return (
      <Card className="p-8 text-center">
        <div className="flex gap-2 justify-center">
          <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
        <p className="text-sm text-[var(--text-muted)] mt-3">Generating questions for {role}…</p>
      </Card>
    );
  }

  const q = questions[currentIndex];
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--text)]">{role} practice</h3>
        <span className="text-sm text-[var(--text-muted)]">
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>
      <p className="text-[var(--text)] mb-4 font-medium">{q}</p>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer here..."
        rows={5}
        className="w-full px-4 py-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-dim)] resize-y mb-4"
      />
      {feedback && (
        <div className="mb-4 p-4 rounded-lg bg-[var(--accent-dim)]/20 border border-[var(--accent)]/30">
          <p className="text-sm font-medium text-[var(--accent)] mb-1">Feedback</p>
          <p className="text-sm text-[var(--text)]">{feedback}</p>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Button onClick={submitAnswer} disabled={evaluating || !answer.trim()}>
          {evaluating ? "Evaluating…" : "Get feedback"}
        </Button>
        {currentIndex > 0 && (
          <Button
            variant="secondary"
            onClick={() => {
              setCurrentIndex((i) => i - 1);
              setFeedback(null);
              setAnswer("");
            }}
          >
            Previous
          </Button>
        )}
        {currentIndex < questions.length - 1 && (
          <Button
            variant="secondary"
            onClick={() => {
              setCurrentIndex((i) => i + 1);
              setFeedback(null);
              setAnswer("");
            }}
          >
            Next question
          </Button>
        )}
        <Button
          variant="ghost"
          onClick={() => {
            setQuestions([]);
            setFeedback(null);
            setAnswer("");
          }}
        >
          End session
        </Button>
      </div>
    </Card>
  );
}
