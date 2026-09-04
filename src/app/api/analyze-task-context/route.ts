import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { task, privateNote, studentContext } = body;

    if (!task || !privateNote) {
      return NextResponse.json(
        { error: "Task and privateNote are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // If API key is available, use OpenAI
    if (apiKey && apiKey !== "your_openai_api_key_here") {
      try {
        const openai = new OpenAI({ apiKey });

        const prompt = `You are NoticeIQ's Task Context Intelligence Assistant.
Analyze this student's private note and context regarding an academic or campus task.
Provide a clear, helpful suggestion and explain why. DO NOT automatically modify the task.

Task Details:
Title: ${task.title || "Untitled Task"}
Description: ${task.description || "None"}
Current Quadrant: ${task.quadrant || task.finalQuadrant || task.aiQuadrant || "Q2"}
Deadline: ${task.deadline || "None"}

Student Private Note:
"${privateNote}"

Student Context:
${studentContext ? JSON.stringify(studentContext) : "Standard student profile"}

Respond strictly with valid JSON with this exact schema:
{
  "suggestion": "Brief 1-2 sentence recommendation for the student",
  "reason": "Why this suggestion is recommended based on their private note",
  "suggestedChanges": ["string describing each concrete recommendation"],
  "suggestedQuadrant": "Q1" | "Q2" | "Q3" | "Q4" | null,
  "confidence": number between 0.0 and 1.0
}`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You analyze student private task notes to suggest helpful priority or action adjustments. Output valid JSON only.",
            },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        });

        const rawContent = response.choices[0]?.message?.content;
        if (rawContent) {
          const parsed = JSON.parse(rawContent);
          return NextResponse.json({
            suggestion: parsed.suggestion || "Consider reviewing your task timeline.",
            reason: parsed.reason || "Based on your note.",
            suggestedChanges: parsed.suggestedChanges || [],
            suggestedQuadrant: parsed.suggestedQuadrant || null,
            confidence: parsed.confidence || 0.85,
          });
        }
      } catch (aiErr) {
        console.warn("OpenAI API call failed, falling back to local heuristic reasoning:", aiErr);
      }
    }

    // High-quality local heuristic fallback reasoning
    const noteLower = privateNote.toLowerCase();
    let suggestion = "";
    let reason = "";
    let suggestedQuadrant: "Q1" | "Q2" | "Q3" | "Q4" | null = null;
    let confidence = 0.85;
    const suggestedChanges: string[] = [];

    if (
      noteLower.includes("income certificate") ||
      noteLower.includes("missing document") ||
      noteLower.includes("pending document") ||
      noteLower.includes("waiting for") ||
      noteLower.includes("blocker") ||
      noteLower.includes("all documents except")
    ) {
      suggestion = "Income certificate / pending prerequisite appears to be the remaining blocker.";
      reason = "Your note indicates that an external document or dependency is required before completing this action.";
      suggestedChanges.push("Prioritize obtaining the prerequisite document first.");
      confidence = 0.92;
    } else if (
      noteLower.includes("tomorrow") ||
      noteLower.includes("submit this tomorrow") ||
      noteLower.includes("unavailable afterward") ||
      noteLower.includes("urgent") ||
      noteLower.includes("asap") ||
      noteLower.includes("before")
    ) {
      suggestion = "Your note indicates that completing this task earlier than scheduled is beneficial.";
      reason = "Upcoming unavailability or short-term personal deadlines make early completion high priority.";
      suggestedChanges.push("Move to Q1 — DO FIRST");
      suggestedQuadrant = "Q1";
      confidence = 0.9;
    } else if (
      noteLower.includes("already completed") ||
      noteLower.includes("already have") ||
      noteLower.includes("half done") ||
      noteLower.includes("partially")
    ) {
      suggestion = "You have already completed preparatory parts of this task.";
      reason = "Reduced remaining effort needed allows quick execution.";
      suggestedChanges.push("Complete the remaining final submission steps.");
      confidence = 0.88;
    } else if (
      noteLower.includes("after 6 pm") ||
      noteLower.includes("evening") ||
      noteLower.includes("weekend") ||
      noteLower.includes("friend is helping")
    ) {
      suggestion = "Schedule this task during your designated evening study block.";
      reason = "Aligns with your availability and assistance from peers.";
      suggestedChanges.push("Allocate time during your preferred evening study window.");
      suggestedQuadrant = "Q2";
      confidence = 0.85;
    } else if (noteLower.includes("closed today") || noteLower.includes("office closed")) {
      suggestion = "College office is closed today — defer physical submission to the next working day.";
      reason = "Administrative offices are currently inaccessible.";
      suggestedChanges.push("Reschedule execution for next working day.");
      confidence = 0.95;
    } else {
      suggestion = "NoticeIQ analyzed your context: ensure prerequisite documents and scheduling are aligned.";
      reason = "Note provides personal context for this action.";
      suggestedChanges.push("Review timeline based on your personal notes.");
      confidence = 0.8;
    }

    return NextResponse.json({
      suggestion,
      reason,
      suggestedChanges,
      suggestedQuadrant,
      confidence,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
