import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { calculateNoticeRelevance } from "@/lib/relevanceEngine";
import { Notice } from "@/types/institution";
import { StudentProfile, NoticeRelevanceLevel } from "@/types/student";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notice, student } = body as {
      notice: Notice;
      student: StudentProfile;
    };

    if (!notice || !student) {
      return NextResponse.json(
        {
          error: "Missing required 'notice' or 'student' payload.",
          code: "INVALID_PAYLOAD",
        },
        { status: 400 }
      );
    }

    // Always run deterministic evaluator first for instant baseline
    const baselineRelevance = calculateNoticeRelevance(notice, student);

    const apiKey = process.env.OPENAI_API_KEY;

    // If no API key configured or offline, gracefully return deterministic baseline
    if (!apiKey || apiKey.trim() === "" || apiKey === "your_key_here") {
      return NextResponse.json({
        success: true,
        relevance: baselineRelevance.relevance,
        score: baselineRelevance.score,
        reason: baselineRelevance.reasons.join(". ") || "Relevance evaluated by NoticeIQ deterministic rules.",
        reasons: baselineRelevance.reasons,
        matchedCriteria: baselineRelevance.matchedCriteria,
        unmatchedCriteria: baselineRelevance.unmatchedCriteria,
        eligibilityStatus: baselineRelevance.eligibilityStatus,
        fallback: true,
      });
    }

    // Sanitize payload - only send minimum necessary fields (no passwords, tokens, private fields)
    const sanitizedStudent = {
      department: student.department,
      year: student.year,
      className: student.className || student.class,
      section: student.section,
      interests: student.interests || [],
    };

    const sanitizedNotice = {
      title: notice.title,
      category: notice.category,
      targetGroup: notice.targetGroup,
      content: notice.content,
      aiAudience: notice.aiAnalysis?.audience,
      requirements: notice.aiAnalysis?.requirements || [],
    };

    const openai = new OpenAI({ apiKey });

    const systemPrompt = `You are NoticeIQ's student relevance engine.
Your task is to answer: "Does this notice actually apply to this student?"
You will evaluate the notice content against the student's profile and preferences.

CRITICAL RULES:
1. NEVER invent eligibility facts. If a notice specifies an eligibility criteria (e.g., CGPA > 8.0, completed prerequisite course, previous semester attendance > 75%) and that information is NOT available in the student profile, you MUST NOT declare the student eligible. Return "MEDIUM" relevance with score 60-70 and explicitly state that eligibility cannot be confirmed because the required information is missing.
2. If the notice is targeted to a different department, year, or class, return "NOT_RELEVANT" with a score between 0 and 19.
3. If the notice matches the student's department, year, section, or aligns with their declared interests, return "HIGH" relevance with a score between 85 and 100.
4. Output strict JSON matching the supplied schema.`;

    const userPrompt = `Student Profile:
${JSON.stringify(sanitizedStudent, null, 2)}

Notice Information:
${JSON.stringify(sanitizedNotice, null, 2)}

Evaluate relevance for this student.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "student_relevance_schema",
          strict: true,
          schema: {
            type: "object",
            properties: {
              relevance: {
                type: "string",
                enum: ["HIGH", "MEDIUM", "LOW", "NOT_RELEVANT"],
                description: "Relevance tier of this notice to the specific student.",
              },
              score: {
                type: "number",
                description: "Internal matching score from 0 to 100.",
              },
              reason: {
                type: "string",
                description: "Clear, human-readable explanation of why this notice is or is not relevant to the student.",
              },
              matchedCriteria: {
                type: "array",
                items: { type: "string" },
                description: "List of matched criteria (e.g. Department CSE, Year 1st Year, Interest in AI).",
              },
              unmatchedCriteria: {
                type: "array",
                items: { type: "string" },
                description: "List of unmatched criteria (e.g. Target was ECE, CGPA information unavailable).",
              },
            },
            required: [
              "relevance",
              "score",
              "reason",
              "matchedCriteria",
              "unmatchedCriteria",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const parsedContent = response.choices[0]?.message?.content;
    if (!parsedContent) {
      return NextResponse.json({
        success: true,
        ...baselineRelevance,
      });
    }

    const aiResult = JSON.parse(parsedContent) as {
      relevance: NoticeRelevanceLevel;
      score: number;
      reason: string;
      matchedCriteria: string[];
      unmatchedCriteria: string[];
    };

    return NextResponse.json({
      success: true,
      relevance: aiResult.relevance,
      score: aiResult.score,
      reason: aiResult.reason,
      reasons: [aiResult.reason, ...baselineRelevance.reasons.slice(1)],
      matchedCriteria: aiResult.matchedCriteria,
      unmatchedCriteria: aiResult.unmatchedCriteria,
      eligibilityStatus: baselineRelevance.eligibilityStatus,
      analyzedByAi: true,
      analyzedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const error = err as { message?: string; status?: number; code?: string };
    console.error("OpenAI Relevance Analysis Error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to analyze relevance.",
        code: error.code || "RELEVANCE_ANALYSIS_ERROR",
      },
      { status: error.status || 500 }
    );
  }
}
