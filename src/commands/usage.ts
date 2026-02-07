import * as p from "@clack/prompts";
import pc from "picocolors";
import {
  fetchQuota,
  type ModelQuota,
  type QuotaSnapshot,
} from "../lib/antigravity-bridge.js";

const BAR_WIDTH = 30;

function renderBar(percent: number): string {
  const filled = Math.round((percent / 100) * BAR_WIDTH);
  const empty = BAR_WIDTH - filled;

  let color: (s: string) => string;
  if (percent > 60) color = pc.green;
  else if (percent > 30) color = pc.yellow;
  else color = pc.red;

  const filledBar = color("█".repeat(filled));
  const emptyBar = pc.dim("░".repeat(empty));
  return `${filledBar}${emptyBar}`;
}

function formatModelRow(model: ModelQuota): string {
  const pct = model.remainingPercent.toFixed(0).padStart(4);
  const bar = renderBar(model.remainingPercent);
  const label = model.label.padEnd(22);
  const reset = model.isExhausted
    ? pc.red(`resets ${model.timeUntilReset}`)
    : model.timeUntilReset !== "Ready"
      ? pc.dim(`resets ${model.timeUntilReset}`)
      : "";
  return `  ${label} ${bar} ${pct}% ${reset}`;
}

function renderChart(snapshot: QuotaSnapshot): void {
  console.clear();
  p.intro(pc.bgCyan(pc.black(" oh-my-ag usage ")));

  const header = [
    `${pc.bold("User")}  ${snapshot.userName}${snapshot.email ? ` (${pc.dim(snapshot.email)})` : ""}`,
    `${pc.bold("Plan")}  ${snapshot.planName}`,
  ].join("\n");
  p.note(header, "Account");

  if (snapshot.promptCredits) {
    const c = snapshot.promptCredits;
    const bar = renderBar(c.remainingPercent);
    const pct = c.remainingPercent.toFixed(0).padStart(4);
    const detail = `${c.available.toLocaleString()} / ${c.monthly.toLocaleString()} credits`;
    const creditLines = [`  ${bar} ${pct}%`, `  ${pc.dim(detail)}`].join("\n");
    p.note(creditLines, "Prompt Credits");
  }

  if (snapshot.models.length === 0) {
    p.note(pc.dim("  No model quota data available"), "Models");
  } else {
    const exhausted = snapshot.models.filter((m) => m.isExhausted);
    const available = snapshot.models.filter((m) => !m.isExhausted);

    const lines: string[] = [];

    if (available.length > 0) {
      for (const model of available) {
        lines.push(formatModelRow(model));
      }
    }

    if (exhausted.length > 0) {
      if (lines.length > 0) lines.push("");
      lines.push(pc.red("  ── Exhausted ──"));
      for (const model of exhausted) {
        lines.push(formatModelRow(model));
      }
    }

    p.note(lines.join("\n"), `Models (${snapshot.models.length})`);
  }

  p.outro(pc.dim(`Updated ${snapshot.timestamp.toLocaleTimeString()}`));
}

export async function usage(jsonMode = false): Promise<void> {
  if (!jsonMode) {
    const spinner = p.spinner();
    spinner.start("Connecting to Antigravity...");

    const snapshot = await fetchQuota();
    spinner.stop(
      snapshot ? "Connected" : pc.red("Failed to connect to Antigravity"),
    );

    if (!snapshot) {
      p.note(
        [
          `${pc.yellow("Antigravity IDE must be running locally.")}`,
          "",
          pc.dim("Make sure the language_server process is active."),
          pc.dim("Try opening a project in Antigravity first."),
        ].join("\n"),
        "Connection Failed",
      );
      process.exit(1);
    }

    renderChart(snapshot);
    return;
  }

  const snapshot = await fetchQuota();
  if (!snapshot) {
    console.log(JSON.stringify({ error: "Failed to connect" }));
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        userName: snapshot.userName,
        email: snapshot.email,
        planName: snapshot.planName,
        promptCredits: snapshot.promptCredits ?? null,
        models: snapshot.models.map((m) => ({
          label: m.label,
          modelId: m.modelId,
          remainingPercent: m.remainingPercent,
          isExhausted: m.isExhausted,
          resetTime: m.resetTime?.toISOString() ?? null,
          timeUntilReset: m.timeUntilReset,
        })),
        timestamp: snapshot.timestamp.toISOString(),
      },
      null,
      2,
    ),
  );
}
