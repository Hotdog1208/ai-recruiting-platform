"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAssessment,
  submitAssessment,
  type AssessmentWithQuestions,
} from "@/lib/assessments";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type Props = {
  assessmentId: string;
  onComplete?: (score: number, passed: boolean) => void;
};

export function TakeAssessment({ assessmentId, onComplete }: Props) {
  const { session } = useAuth();
  const token = session?.access_token ?? null;
  const [assessment, setAssessment] = useState<AssessmentWithQuestions | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean; passing_score: number } | null>(null);

  useEffect(() => {
    getAssessment(assessmentId, token)
      .then(setAssessment)
      .catch(() => setAssessment(null))
      .finally(() => setLoading(false));
  }, [assessmentId, token]);

  useEffect(() => {
    if (assessment) setAnswers(Array(assessment.questions.length).fill(-1));
  }, [assessment]);

  if (loading || !assessment) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    );
  }

  if (result !== null) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-xl font-semibold text-[var(--text)] mb-2">Assessment complete</h3>
        <p className="text-4xl font-bold text-[var(--accent)] mb-1">{result.score}%</p>
        <p className="text-[var(--text-muted)] mb-4">
          Passing score: {result.passing_score}%
        </p>
        <p className={result.passed ? "text-emerald-400 font-medium" : "text-amber-400"}>
          {result.passed ? "You passed! This skill will appear on your profile." : "You didn't pass this time. You can retake the assessment."}
        </p>
      </Card>
    );
  }

  const questions = assessment.questions;
  const q = questions[currentIndex];
  const canSubmit = answers.every((a) => a >= 0);

  const handleSubmit = async () => {
    if (!canSubmit || !token) return;
    setSubmitting(true);
    try {
      const r = await submitAssessment(
        assessmentId,
        answers,
        token
      );
      setResult({ score: r.score, passed: r.passed, passing_score: r.passing_score });
      onComplete?.(r.score, r.passed);
    } catch {
      // leave result null, user can try again
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[var(--text)]">{assessment.skill_name}</h3>
        <span className="text-sm text-[var(--text-muted)]">
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>
      {q && (
        <>
          <p className="text-[var(--text)] mb-4">{q.question}</p>
          <ul className="space-y-2">
            {q.options.map((opt, idx) => (
              <li key={idx}>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] hover:bg-white/5 cursor-pointer has-[:checked]:border-[var(--accent)] has-[:checked]:bg-[var(--accent-dim)]/20">
                  <input
                    type="radio"
                    name={`q-${currentIndex}`}
                    checked={answers[currentIndex] === idx}
                    onChange={() => {
                      const next = [...answers];
                      next[currentIndex] = idx;
                      setAnswers(next);
                    }}
                    className="w-4 h-4 text-[var(--accent)]"
                  />
                  <span className="text-[var(--text)]">{opt}</span>
                </label>
              </li>
            ))}
          </ul>
        </>
      )}
      <div className="flex justify-between mt-6">
        <Button
          variant="secondary"
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
        >
          Previous
        </Button>
        {currentIndex < questions.length - 1 ? (
          <Button
            onClick={() => setCurrentIndex((i) => i + 1)}
            disabled={answers[currentIndex] < 0}
          >
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!canSubmit || submitting}>
            {submitting ? "Submitting…" : "Submit"}
          </Button>
        )}
      </div>
    </Card>
  );
}
