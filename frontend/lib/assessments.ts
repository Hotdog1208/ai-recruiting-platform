import { apiGet, apiPost } from "@/lib/api";

export type AssessmentSummary = {
  id: string;
  skill_name: string;
  description: string | null;
  question_count: number;
  passing_score: number;
  duration_minutes: number;
};

export type AssessmentWithQuestions = AssessmentSummary & {
  questions: { question: string; options: string[] }[];
};

export type AssessmentResultSummary = {
  assessment_id: string;
  skill_name: string;
  score: number;
  passed: boolean;
  completed_at: string | null;
};

export async function listAssessments(): Promise<AssessmentSummary[]> {
  return apiGet<AssessmentSummary[]>("/assessments", null);
}

export async function getAssessment(
  assessmentId: string,
  token?: string | null
): Promise<AssessmentWithQuestions> {
  return apiGet<AssessmentWithQuestions>(`/assessments/${assessmentId}`, token);
}

export async function submitAssessment(
  assessmentId: string,
  answers: number[],
  token: string | null
): Promise<{ result_id: string; score: number; passed: boolean; passing_score: number }> {
  return apiPost(
    `/assessments/${assessmentId}/submit`,
    { answers },
    token
  );
}

export async function myAssessmentResults(
  token: string | null
): Promise<AssessmentResultSummary[]> {
  return apiGet<AssessmentResultSummary[]>("/assessments/my/results", token);
}
