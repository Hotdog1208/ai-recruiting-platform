import { apiGet, apiPost } from "@/lib/api";

export async function getInterviewStatus(token?: string | null): Promise<{ available: boolean }> {
  return apiGet<{ available: boolean }>("/interview/status", token);
}

export async function generateInterviewQuestions(
  role: string,
  token: string | null
): Promise<{ questions: string[]; role: string }> {
  return apiPost<{ questions: string[]; role: string }>(
    "/interview/generate-questions",
    { role },
    token
  );
}

export async function evaluateAnswer(
  question: string,
  answer: string,
  token: string | null
): Promise<{ feedback: string; suggestions: string[] }> {
  return apiPost<{ feedback: string; suggestions: string[] }>(
    "/interview/evaluate-answer",
    { question, answer },
    token
  );
}
