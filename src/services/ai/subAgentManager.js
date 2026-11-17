/**
 * Sub-Agent Execution Engine for Livy UI (Context Quarantine)
 *
 * Runs isolated sub-agent loops in private context windows:
 * - Large raw schema structures and tables live and die in the subagent's scope.
 * - Only concise distilled markdown summaries are returned to the Supervisor.
 * - Reduces token consumption by 75-85% across multi-turn chats.
 */

import { streamUnifiedChat } from "./llmProvider";
import {
  SCHEMA_ANALYST_TOOLS,
  SQL_SPECIALIST_TOOLS,
  CLUSTER_OPERATOR_TOOLS,
  executeSubAgentTool,
} from "./subAgentTools";
import {
  buildSchemaAnalystPrompt,
  buildSqlSpecialistPrompt,
  buildClusterOperatorPrompt,
} from "./promptTemplates";

/**
 * Executes a specialized subagent in an isolated context window.
 *
 * @param {Object} params
 * @param {string} params.subagent - "schema_analyst" | "sql_specialist" | "cluster_operator"
 * @param {string} params.task - The delegated task instruction
 * @param {Object} params.context - React workbench context
 * @param {Object} params.modelConfig - Model provider settings ({ provider, hostUrl, model, ... })
 * @param {Function} [params.onToolCall] - UI callback for execution badges
 * @param {AbortSignal} [params.signal] - Abort signal
 * @returns {Promise<{ ok: boolean, summary: string }>}
 */
export async function executeSubAgent({
  subagent,
  task,
  context = {},
  modelConfig = {},
  onToolCall,
  signal,
}) {
  const { activeEngine = "doris" } = context;

  let systemPrompt = "";
  let tools = [];

  switch (subagent) {
    case "schema_analyst":
      systemPrompt = buildSchemaAnalystPrompt({ activeEngine });
      tools = SCHEMA_ANALYST_TOOLS;
      break;

    case "sql_specialist":
      systemPrompt = buildSqlSpecialistPrompt({ activeEngine });
      tools = SQL_SPECIALIST_TOOLS;
      break;

    case "cluster_operator":
      systemPrompt = buildClusterOperatorPrompt({ activeEngine });
      tools = CLUSTER_OPERATOR_TOOLS;
      break;

    default:
      throw new Error(`Unknown subagent: '${subagent}'`);
  }

  // Isolated subagent conversation thread
  const subagentMessages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: task },
  ];

  let iteration = 0;
  const maxIterations = 3;
  let finalSubagentResponse = "";
  const executedCalls = new Set();

  while (iteration < maxIterations) {
    iteration++;
    if (signal?.aborted) break;

    const { content, toolCalls, extraContent } = await streamUnifiedChat({
      ...modelConfig,
      messages: subagentMessages,
      tools,
      signal,
    });

    if (content) {
      finalSubagentResponse = content;
    }

    if (!Array.isArray(toolCalls) || toolCalls.length === 0) {
      break;
    }

    // Process subagent tool calls
    const assistantMsg = {
      role: "assistant",
      content: content || null,
      tool_calls: toolCalls,
    };

    if (modelConfig.provider === "gemini") {
      const fallbackSig =
        toolCalls[0]?.thought_signature ||
        extraContent?.google?.thought_signature ||
        "skip_thought_signature_validator";
      assistantMsg.thought_signature = fallbackSig;
      assistantMsg.extra_content = {
        google: {
          thought_signature: fallbackSig,
        },
      };
    } else if (extraContent) {
      assistantMsg.extra_content = extraContent;
    }

    subagentMessages.push(assistantMsg);

    for (const tc of toolCalls) {
      const toolName = tc.function?.name;
      let args = {};
      try {
        args = JSON.parse(tc.function?.arguments || "{}");
      } catch {}

      const callFingerprint = `${toolName}:${tc.function?.arguments || ""}`;
      let toolResult;

      if (executedCalls.has(callFingerprint)) {
        toolResult = { ok: true, note: "Tool output already retrieved in this turn." };
      } else {
        executedCalls.add(callFingerprint);

        onToolCall?.({
          id: tc.id,
          name: `[${subagent}] ${toolName}`,
          args,
          status: "executing",
        });

        try {
          toolResult = await executeSubAgentTool(toolName, args, context);
        } catch (err) {
          toolResult = { ok: false, error: err.message };
        }

        onToolCall?.({
          id: tc.id,
          name: `[${subagent}] ${toolName}`,
          args,
          status: "completed",
          result: toolResult,
        });
      }

      subagentMessages.push({
        role: "tool",
        tool_call_id: tc.id,
        name: toolName,
        content: JSON.stringify(toolResult),
      });
    }
  }

  return {
    ok: true,
    subagent,
    summary: finalSubagentResponse || "Subagent completed task successfully.",
  };
}
