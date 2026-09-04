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

    // Helper: Build robust fallback analysis if OpenAI is unconfigured or fails
    const buildFallbackAnalysis = (): NoticeAiAnalysis => {
      const lower = (content || "").toLowerCase();
      const titleLower = (title || "").toLowerCase();

      // Detect notice type
      let noticeType: NoticeAiAnalysis["notice_type"] = "GENERAL";
      if (category === "Scholarship" || lower.includes("scholarship") || titleLower.includes("scholarship")) {
        noticeType = "SCHOLARSHIP";
      } else if (category === "Examination" || lower.includes("exam") || titleLower.includes("exam")) {
        noticeType = "EXAMINATION";
      } else if (category === "Academic" || lower.includes("academic") || lower.includes("syllabus")) {
        noticeType = "ACADEMIC";
      } else if (category === "Assignment" || lower.includes("assignment") || lower.includes("project")) {
        noticeType = "ASSIGNMENT";
      } else if (category === "Placement" || lower.includes("placement") || lower.includes("recruitment")) {
        noticeType = "PLACEMENT";
      } else if (category === "Event" || lower.includes("event") || lower.includes("workshop") || lower.includes("seminar")) {
        noticeType = "EVENT";
      }

      // Extract departments and years
      const depts: string[] = [];
      if (lower.includes("cse") || lower.includes("computer science")) depts.push("CSE");
      if (lower.includes("ece") || lower.includes("electronics")) depts.push("ECE");
      if (lower.includes("it") || lower.includes("information technology")) depts.push("IT");
      if (lower.includes("me") || lower.includes("mechanical")) depts.push("ME");
      if (lower.includes("ce") || lower.includes("civil")) depts.push("CE");
      if (lower.includes("ee") || lower.includes("electrical")) depts.push("EE");

      const years: string[] = [];
      if (lower.includes("1st year") || lower.includes("first year") || lower.includes("1st-year")) years.push("1st Year");
      if (lower.includes("2nd year") || lower.includes("second year")) years.push("2nd Year");
      if (lower.includes("3rd year") || lower.includes("third year")) years.push("3rd Year");
      if (lower.includes("4th year") || lower.includes("final year")) years.push("4th Year");

      // Extract tasks & dependencies
      const tasks: NoticeAiAnalysis["tasks"] = [];
      const dependencies: NoticeAiAnalysis["dependencies"] = [];
      const documents: string[] = [];

      if (noticeType === "SCHOLARSHIP") {
        documents.push("Income Certificate (issued by SDO / BDO / competent authority)");
        documents.push("Previous Academic Marksheets & Grade Cards");
        documents.push("Institution Identity Card & Fee Receipt");
        documents.push("Bank Account Passbook / Cancelled Cheque");

        tasks.push({
          title: "Obtain Income Certificate",
          description: "Procure official income certificate from competent authority (SDO / BDO / DM).",
          deadline: deadline || "2026-03-20",
          estimated_minutes: 60,
        });
        tasks.push({
          title: "Collect Required Documents",
          description: "Assemble previous marksheets, institute ID card, and bank passbook copies.",
          deadline: deadline || "2026-03-24",
          estimated_minutes: 45,
        });
        tasks.push({
          title: "Complete Scholarship Application",
          description: "Fill out the online scholarship application portal with verified personal and academic details.",
          deadline: deadline || "2026-03-28",
          estimated_minutes: 45,
        });
        tasks.push({
          title: "Submit Application",
          description: "Submit hard copy with attached verified documents to the Institute Scholarship Cell.",
          deadline: deadline || "2026-03-31",
          estimated_minutes: 30,
        });

        dependencies.push({
          blocked_task: "Complete Scholarship Application",
          required_task: "Obtain Income Certificate",
        });
        dependencies.push({
          blocked_task: "Submit Application",
          required_task: "Complete Scholarship Application",
        });
      } else {
        // Generic task extraction based on lines and action words
        const lines = content.split("\n").map((l: string) => l.trim()).filter(Boolean);
        const actionLines = lines.filter((l: string) =>
          /^(submit|collect|apply|complete|attend|register|pay|upload|fill|bring|verify)\b/i.test(l)
        );

        if (actionLines.length > 0) {
          actionLines.slice(0, 4).forEach((line: string) => {
            const cleanTitle = line.replace(/^[-*•\d.]+\s*/, "").slice(0, 60);
            tasks.push({
              title: cleanTitle,
              description: line,
              deadline: deadline || null,
              estimated_minutes: 30,
            });
          });
        } else {
          tasks.push({
            title: `Review ${title || "Notice"} Requirements`,
            description: "Read full details and confirm personal eligibility and next steps.",
            deadline: deadline || null,
            estimated_minutes: 20,
          });
          if (deadline) {
            tasks.push({
              title: `Complete Submission for ${title || "Notice"}`,
              description: "Finalize all required actions and submit before stated deadline.",
              deadline,
              estimated_minutes: 45,
            });
          }
        }
      }

      // Summary
      const sentences = content.split(/(?<=[.?!])\s+/).filter(Boolean);
      const summary = sentences.slice(0, 2).join(" ") || `Important institutional announcement regarding ${title}.`;

      return {
        summary: summary.slice(0, 300),
        notice_type: noticeType,
        audience: {
          departments: depts.length > 0 ? depts : ["All Departments"],
          years: years.length > 0 ? years : ["All Years"],
          classes: [],
          sections: [],
        },
        dates: {
          publication_date: new Date().toISOString().split("T")[0],
          deadline: deadline || null,
          event_date: eventDate || null,
          start_time: null,
          end_time: null,
        },
        requirements: [
          "Must be an enrolled student of the target department / cohort.",
          "Must satisfy stated academic and eligibility requirements.",
          "Must submit all required documentation prior to stated deadlines.",
        ],
        documents_required: documents.length > 0 ? documents : ["Student ID Card", "Relevant Academic Records"],
        tasks,
        consequences: [
          "Late submissions will not be processed by the academic office.",
          "Incomplete applications or missing documents may lead to disqualification.",
        ],
        dependencies,
        important_points: [
          `Category: ${category || "General"}`,
          `Target: ${targetGroup || "All Students"}`,
          deadline ? `Strict Deadline: ${deadline}` : "No specific deadline indicated.",
          "Carefully verify all required prerequisites before final submission.",
        ],
        confidence: 0.85,
      };
    };

    if (!apiKey || apiKey.trim() === "" || apiKey === "your_key_here" || apiKey === "your_openai_api_key_here") {
      const fallbackAnalysis = buildFallbackAnalysis();
      return NextResponse.json({
        success: true,
        analysis: fallbackAnalysis,
        analyzedAt: new Date().toISOString(),
        isFallback: true,
        message: "Analyzed using NoticeIQ deterministic extraction engine (OpenAI API key not configured).",
      });
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
      const fallbackAnalysis = buildFallbackAnalysis();
      return NextResponse.json({
        success: true,
        analysis: fallbackAnalysis,
        analyzedAt: new Date().toISOString(),
        isFallback: true,
        message: "Notice analyzed using NoticeIQ deterministic extraction (AI returned empty response).",
      });
    }

    try {
      const structuredAnalysis: NoticeAiAnalysis = JSON.parse(parsedContent);
      return NextResponse.json({
        success: true,
        analysis: structuredAnalysis,
        analyzedAt: new Date().toISOString(),
      });
    } catch {
      const fallbackAnalysis = buildFallbackAnalysis();
      return NextResponse.json({
        success: true,
        analysis: fallbackAnalysis,
        analyzedAt: new Date().toISOString(),
        isFallback: true,
        message: "Notice analyzed using NoticeIQ deterministic extraction (AI response parsed with safe fallback).",
      });
    }
  } catch (err: unknown) {
    const error = err as { message?: string; status?: number; code?: string };
    console.warn("Notice Analysis recovered via fallback:", error?.message || "AI service unreachable");
    
    // Fallback gracefully so notice workflow never breaks
    return NextResponse.json({
      success: true,
      analysis: {
        summary: "Notice analysis generated using NoticeIQ deterministic engine. Please review and edit details if needed.",
        notice_type: "GENERAL",
        audience: {
          departments: ["All Departments"],
          years: ["All Years"],
          classes: [],
          sections: [],
        },
        dates: {
          publication_date: new Date().toISOString().split("T")[0],
          deadline: null,
          event_date: null,
          start_time: null,
          end_time: null,
        },
        requirements: ["Review notice instructions and verify eligibility."],
        documents_required: ["Student ID Card"],
        tasks: [
          {
            title: "Review Notice Requirements",
            description: "Read notice carefully and confirm applicable actions.",
            deadline: null,
            estimated_minutes: 20,
          },
        ],
        consequences: ["Deadlines are strictly enforced."],
        dependencies: [],
        important_points: ["AI analysis unavailable right now; safe fallback active."],
        confidence: 0.8,
      },
      analyzedAt: new Date().toISOString(),
      isFallback: true,
      message: "AI analysis unavailable. Generated safe fallback view.",
    });
  }
}
