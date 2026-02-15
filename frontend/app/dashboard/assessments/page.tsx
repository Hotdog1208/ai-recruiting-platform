"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { listAssessments, myAssessmentResults, type AssessmentSummary, type AssessmentResultSummary } from "@/lib/assessments";
import { TakeAssessment } from "@/components/assessments/TakeAssessment";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AssessmentsPage() {
  const { session, role } = useAuth();
  const token = session?.access_token ?? null;
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [myResults, setMyResults] = useState<AssessmentResultSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [takingId, setTakingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [assessmentsRes, resultsRes] = await Promise.all([
        listAssessments().catch(() => []),
        token ? myAssessmentResults(token).catch(() => []) : Promise.resolve([]),
      ]);
      if (cancelled) return;
      setAssessments(Array.isArray(assessmentsRes) ? assessmentsRes : []);
      setMyResults(Array.isArray(resultsRes) ? resultsRes : []);
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const getResult = (assessmentId: string) => myResults.find((r) => r.assessment_id === assessmentId);

  if (takingId) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setTakingId(null)}
          className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] mb-4"
        >
          ← Back to assessments
        </button>
        <TakeAssessment
          assessmentId={takingId}
          onComplete={() => {
            setTakingId(null);
            if (token) myAssessmentResults(token).then(setMyResults);
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-[var(--text)] mb-2">Skill assessments</h1>
      <p className="text-[var(--text-muted)] text-sm mb-6">
        Pass assessments to verify your skills. Verified skills appear on your profile and help employers trust your experience.
      </p>
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-white/5" />
          ))}
        </div>
      ) : assessments.length === 0 ? (
        <Card className="p-8 text-center text-[var(--text-muted)]">
          No assessments available yet.
        </Card>
      ) : (
        <div className="grid gap-4">
          {assessments.map((a) => {
            const result = getResult(a.id);
            return (
              <Card key={a.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium text-[var(--text)]">{a.skill_name}</h3>
                  {a.description && (
                    <p className="text-sm text-[var(--text-muted)] mt-1">{a.description}</p>
                  )}
                  <p className="text-xs text-[var(--text-dim)] mt-1">
                    {a.question_count} questions · {a.duration_minutes} min · Pass: {a.passing_score}%
                  </p>
                  {result && (
                    <p className={`text-sm mt-2 font-medium ${result.passed ? "text-emerald-400" : "text-amber-400"}`}>
                      {result.passed ? "✓ Passed" : "Not passed"} — {result.score}%
                    </p>
                  )}
                </div>
                <div className="shrink-0">
                  {role === "candidate" ? (
                    <Button onClick={() => setTakingId(a.id)}>
                      {result ? "Retake" : "Take assessment"}
                    </Button>
                  ) : (
                    <p className="text-sm text-[var(--text-muted)]">Sign in as a candidate to take assessments.</p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
