/**
 * Client-Side Agent Loop (ReAct / Function Calling)
 * Handles streaming response, multi-step tool execution, and action card extraction.
 */

import { streamUnifiedChat } from "./llmProvider";
import { TOOL_DEFINITIONS, executeTool } from "./agentTools";
import { buildSystemPrompt } from "./promptTemplates";

/**
 * Extracts SQL code blocks from markdown text to generate 1-click action cards.
 */
export function extractSqlBlocks(text = "") {
  if (!text) return [];
  const regex = /```(?:sql)?\s*([\s\S]*?)```/gi;
  const blocks = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    const rawSql = match[1].trim();
    if (rawSql.length > 5) {
      blocks.push(rawSql);
    }
  }
  return blocks;
}

/**
 * Runs the agent loop in the browser.
 *
 * @param {Object} params
 * @param {string} params.hostUrl
 * @param {string} params.model
 * @param {boolean} params.supportsTools
 * @param {Array} params.history - [{ role, content, ... }]
 * @param {Object} params.context - { sqlFiles, editorRef, schemaContext, livyContext, activeEngine }
 * @param {Function} params.onChunk - Text streaming callback
 * @param {Function} params.onReasoningChunk - Thinking streaming callback
 * @param {Function} params.onToolCall - Tool execution callback (name, args, status, result)
 * @param {AbortSignal} params.signal
 * @returns {Promise<{ content: string, reasoning: string, toolResults: Array, actionCards: Array }>}
 */
export async function runAgentConversation({
  provider = "ollama",
  hostUrl,
  geminiApiKey,
  openaiApiKey,
  customUrl,
  customApiKey,
  model,
  supportsTools = true,
  history = [],
  context = {},
  onChunk,
  onReasoningChunk,
  onToolCall,
  signal,
}) {
  const {
    sqlFiles,
    livyContext,
    schemaContext,
    activeEngine = "spark",
  } = context;

  // Build schema summary
  let schemaSummary = "";
  if (schemaContext?.databases?.length > 0) {
    schemaSummary = schemaContext.databases
      .slice(0, 5)
      .map(
        (db) =>
          `  - Database "${db.name}": ${(db.tables || [])
            .slice(0, 8)
            .map((t) => t.name || t)
            .join(", ")}`
      )
      .join("\n");
  }

  const systemPrompt = buildSystemPrompt({
    activeEngine,
    activeFileName: sqlFiles?.activeFile?.name,
    activeFileContent: sqlFiles?.activeFile?.content,
    schemaSummary,
    livySessionState: livyContext?.sessionState,
  });

  const conversationMessages = [
    { role: "system", content: systemPrompt },
    ...history,
  ];

  // Append user prompt if not already present as the final message
  if (
    prompt &&
    (!conversationMessages.length ||
      conversationMessages[conversationMessages.length - 1]?.content !== prompt)
  ) {
    conversationMessages.push({ role: "user", content: prompt });
  }

  let iteration = 0;
  const maxIterations = 4;
  let finalContent = "";
  let finalReasoning = "";
  const allToolResults = [];

  while (iteration < maxIterations) {
    iteration++;

    // Only pass tools if the model supports them
    const toolsToPass = supportsTools ? TOOL_DEFINITIONS : null;

    let turnContent = "";
    let turnReasoning = "";

    const { content, reasoning, toolCalls, extraContent } = await streamUnifiedChat({
      provider,
      hostUrl,
      geminiApiKey,
      openaiApiKey,
      customUrl,
      customApiKey,
      model,
      messages: conversationMessages,
      tools: toolsToPass,
      onChunk: (chunk) => {
        turnContent += chunk;
        onChunk?.(chunk);
      },
      onReasoningChunk: (rChunk) => {
        turnReasoning += rChunk;
        onReasoningChunk?.(rChunk);
      },
      signal,
    });

    finalContent += (finalContent ? "\n" : "") + (content || "");
    finalReasoning += (finalReasoning ? "\n" : "") + (reasoning || "");

    // If no tool calls were made, we are finished
    if (!Array.isArray(toolCalls) || toolCalls.length === 0) {
      break;
    }

    // Process tool calls
    const assistantMessageWithTools = {
      role: "assistant",
      content: content || null,
      tool_calls: toolCalls,
    };
    if (provider === "gemini") {
      const fallbackSig =
        toolCalls[0]?.thought_signature ||
        extraContent?.google?.thought_signature ||
        "skip_thought_signature_validator";
      assistantMessageWithTools.thought_signature = fallbackSig;
      assistantMessageWithTools.extra_content = {
        google: {
          thought_signature: fallbackSig,
        },
      };
    } else if (extraContent && Object.keys(extraContent).length > 0) {
      assistantMessageWithTools.extra_content = extraContent;
    }
    conversationMessages.push(assistantMessageWithTools);

    for (const tc of toolCalls) {
      const toolName = tc.function?.name;
      let args = {};
      try {
        args = JSON.parse(tc.function?.arguments || "{}");
      } catch (e) {
        console.warn(`[AgentRunner] Could not parse tool arguments for ${toolName}:`, tc.function?.arguments);
      }

      onToolCall?.({
        id: tc.id,
        name: toolName,
        args,
        status: "executing",
      });

      let toolResult;
      try {
        toolResult = await executeTool(toolName, args, context);
      } catch (err) {
        toolResult = { ok: false, error: err.message };
      }

      allToolResults.push({ id: tc.id, name: toolName, args, result: toolResult });

      onToolCall?.({
        id: tc.id,
        name: toolName,
        args,
        status: "completed",
        result: toolResult,
      });

      conversationMessages.push({
        role: "tool",
        tool_call_id: tc.id,
        name: toolName,
        content: JSON.stringify(toolResult),
      });
    }

    // Notify UI for intermediate separation
    onChunk?.("\n\n");
  }

  // Extract any SQL blocks for 1-click Action Cards in the UI
  const sqlBlocks = extractSqlBlocks(finalContent);

  return {
    content: finalContent,
    reasoning: finalReasoning,
    toolResults: allToolResults,
    actionCards: sqlBlocks,
  };
}
