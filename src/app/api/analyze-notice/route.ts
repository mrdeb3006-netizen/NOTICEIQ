import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { NoticeAiAnalysis } from "@/types/institution";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, category, content, deadline, targetGroup, venue, eventDate } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        {
          error: "Please add notice content before running AI analysis.",
          code: "EMPTY_CONTENT",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey.trim() === "" || apiKey === "your_key_here") {
      return NextResponse.json(
        {
          error: "OPENAI_API_KEY is not configured on the server. Please add your key to .env.local to enable live OpenAI analysis.",
          code: "MISSING_API_KEY",
        },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const systemPrompt = `You are NoticeIQ's notice understanding engine.
Analyze an institutional notice and extract only information supported by the notice.
Do not invent deadlines, requirements, tasks, consequences, audience information or facts.
If information is missing, return null or an empty array.
Separate explicitly stated information from reasonable interpretations.
The output must follow the supplied structured schema.
Do NOT assign priority quadrants (Q1, Q2, Q3, Q4) or final student priority scores in this step.`;

    const userPrompt = `Notice Metadata:
Title: ${title || "Untitled"}
Category: ${category || "General"}
Target Audience: ${targetGroup || "All Students"}
Stated Deadline: ${deadline || "Not specified"}
Stated Event Date: ${eventDate || "Not specified"}
Stated Venue: ${venue || "Not specified"}

Notice Raw Content:
"""
${content}
"""

Extract structured understanding according to the JSON format.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "notice_understanding_schema",
          strict: true,
          schema: {
            type: "object",
            properties: {
              summary: {
                type: "string",
                description: "Short student-friendly summary of 1 to 3 sentences preserving core deadlines and essential actions.",
              },
              notice_type: {
                type: "string",
                enum: [
                  "ACADEMIC",
                  "EXAMINATION",
                  "SCHOLARSHIP",
                  "ASSIGNMENT",
                  "EVENT",
                  "ADMINISTRATION",
                  "PLACEMENT",
                  "CLUB_ACTIVITY",
                  "GENERAL",
                ],
                description: "Classification of notice type.",
              },
              audience: {
                type: "object",
                properties: {
                  departments: {
                    type: "array",
                    items: { type: "string" },
                    description: "Explicitly mentioned departments (e.g. CSE, ECE). Empty if all or none mentioned.",
                  },
                  years: {
                    type: "array",
                    items: { type: "string" },
                    description: "Explicitly mentioned years (e.g. 1st Year). Empty if all or none mentioned.",
                  },
                  classes: {
                    type: "array",
                    items: { type: "string" },
                    description: "Explicitly mentioned classes (e.g. Class 10). Empty if all or none mentioned.",
                  },
                  sections: {
                    type: "array",
                    items: { type: "string" },
                    description: "Explicitly mentioned sections (e.g. Section A). Empty if all or none mentioned.",
                  },
                },
                required: ["departments", "years", "classes", "sections"],
                additionalProperties: false,
              },
              dates: {
                type: "object",
                properties: {
                  publication_date: {
                    type: ["string", "null"],
                    description: "Publication date in YYYY-MM-DD format if stated, else null.",
                  },
                  deadline: {
                    type: ["string", "null"],
                    description: "Action deadline date in YYYY-MM-DD or readable format if stated, else null.",
                  },
                  event_date: {
                    type: ["string", "null"],
                    description: "Date of event/session in YYYY-MM-DD if stated, else null.",
                  },
                  start_time: {
                    type: ["string", "null"],
                    description: "Start time in HH:MM format if stated, else null.",
                  },
                  end_time: {
                    type: ["string", "null"],
                    description: "End time in HH:MM format if stated, else null.",
                  },
                },
                required: ["publication_date", "deadline", "event_date", "start_time", "end_time"],
                additionalProperties: false,
              },
              requirements: {
                type: "array",
                items: { type: "string" },
                description: "List of prerequisite criteria or actions students must satisfy.",
              },
              documents_required: {
                type: "array",
                items: { type: "string" },
                description: "Exact list of required documents, certificates, or IDs.",
              },
              tasks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string", description: "Concise actionable task title." },
                    description: { type: ["string", "null"], description: "Brief description of the task." },
                    deadline: { type: ["string", "null"], description: "Deadline date if specific to this task." },
                    estimated_minutes: { type: ["number", "null"], description: "Estimated completion time in minutes." },
                  },
                  required: ["title", "description", "deadline", "estimated_minutes"],
                  additionalProperties: false,
                },
                description: "Actionable tasks extracted from notice actions.",
              },
              consequences: {
                type: "array",
                items: { type: "string" },
                description: "Statements describing outcomes if students fail to comply or miss deadlines.",
              },
              dependencies: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    blocked_task: { type: "string", description: "The task that cannot proceed." },
                    required_task: { type: "string", description: "The prerequisite task that must be done first." },
                  },
                  required: ["blocked_task", "required_task"],
                  additionalProperties: false,
                },
                description: "Prerequisite dependencies between tasks explicitly stated or strongly implied.",
              },
              important_points: {
                type: "array",
                items: { type: "string" },
                description: "3 to 7 key factual points from the notice.",
              },
              confidence: {
                type: "number",
                description: "Overall extraction confidence score between 0.0 and 1.0.",
              },
            },
            required: [
              "summary",
              "notice_type",
              "audience",
              "dates",
              "requirements",
              "documents_required",
              "tasks",
              "consequences",
              "dependencies",
              "important_points",
              "confidence",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const parsedContent = response.choices[0]?.message?.content;
    if (!parsedContent) {
      return NextResponse.json(
        { error: "OpenAI returned an empty response.", code: "EMPTY_RESPONSE" },
        { status: 502 }
      );
    }

    const structuredAnalysis: NoticeAiAnalysis = JSON.parse(parsedContent);

    return NextResponse.json({
      success: true,
      analysis: structuredAnalysis,
      analyzedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const error = err as { message?: string; status?: number; code?: string };
    console.error("OpenAI Notice Analysis Error:", error);
    return NextResponse.json(
      {
        error: error.message || "An unexpected error occurred during AI notice analysis.",
        code: error.code || "OPENAI_ERROR",
      },
      { status: error.status || 500 }
    );
  }
}
