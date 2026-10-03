import { createParser } from "eventsource-parser";
import { flushSync } from "react-dom";

type ImagePayload = { type?: string; b64_json?: string; error?: { message?: string } };

export async function streamImage(
  endpoint: string,
  input: Record<string, unknown>,
  onFrame: (dataUrl: string, isFinal: boolean) => void,
) {
  const send = (stream: boolean) => fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, stream }),
  });
  const response = await send(true);
  if (!response.ok || !response.body) throw new Error(await readError(response));

  let sawCompleted = false;
  let sawEvent = false;
  let streamError = "";
  const parser = createParser({
    onEvent(event) {
      let payload: ImagePayload | undefined;
      try { payload = JSON.parse(event.data) as ImagePayload; } catch { return; }
      if (event.event === "error" || payload.type === "error") {
        sawEvent = true;
        streamError = payload.error?.message ?? "Image generation failed";
        return;
      }
      const type = event.event || payload.type;
      if (type !== "image_generation.partial_image" && type !== "image_generation.completed") return;
      sawEvent = true;
      if (!payload.b64_json) { streamError = "Image event contained no image"; return; }
      const isFinal = type === "image_generation.completed";
      flushSync(() => onFrame(`data:image/png;base64,${payload?.b64_json}`, isFinal));
      if (isFinal) sawCompleted = true;
    },
  });
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  try {
    while (true) {
      let chunk: ReadableStreamReadResult<string>;
      try { chunk = await reader.read(); }
      catch (error) { if (sawEvent) throw error; break; }
      if (chunk.done) break;
      parser.feed(chunk.value);
    }
  } finally { await reader.cancel().catch(() => undefined); }

  if (streamError) throw new Error(streamError);
  if (!sawEvent) {
    const replay = await send(false);
    if (!replay.ok) throw new Error(await readError(replay));
    const json = await replay.json() as { data?: { b64_json?: string }[] };
    const image = json.data?.[0]?.b64_json;
    if (!image) throw new Error("Image generation returned no image");
    onFrame(`data:image/png;base64,${image}`, true);
    return;
  }
  if (!sawCompleted) throw new Error("Image stream ended without a completed event");
}

async function readError(response: Response) {
  try {
    const json = await response.json() as { message?: string; error?: { message?: string } };
    return json.error?.message ?? json.message ?? `Image generation failed (${response.status})`;
  } catch { return `Image generation failed (${response.status})`; }
}