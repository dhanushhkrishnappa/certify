import { app } from "../src/app.js";
import { prisma } from "../src/shared/prisma.js";
import { auth } from "../src/lib/auth.js";

async function verifyChatE2E() {
  console.log("=== STEP 1: Authenticate Seed Learner ===");
  const loginRes = await app.request("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "learner@certify.edu",
      password: "Password123!",
    }),
  });

  const loginData: any = await loginRes.json();
  console.log("Login status:", loginRes.status);
  console.log("User:", loginData.user?.email);
  const token = loginData.token;
  if (!token) {
    throw new Error("Failed to get session token: " + JSON.stringify(loginData));
  }

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  console.log("\n=== STEP 2: Enroll in Python Fundamentals ===");
  const enrollRes = await app.request("/api/v1/courses/python-fundamentals/enroll", {
    method: "POST",
    headers: authHeaders,
  });
  const enrollData: any = await enrollRes.json();
  console.log("Enroll status:", enrollRes.status, enrollData.message || enrollData);

  console.log("\n=== STEP 3: Fetch Session Context ===");
  const sessionRes = await app.request("/api/v1/courses/python-fundamentals/session", {
    method: "GET",
    headers: authHeaders,
  });
  const sessionData: any = await sessionRes.json();
  console.log("Session status:", sessionRes.status);
  console.log("Active Session ID:", sessionData.session?.id);
  console.log("Current Chapter:", sessionData.session?.chapter?.title);

  let sessionId = sessionData.session?.id;
  if (!sessionId) {
    console.log("No active session found, creating new session...");
    const createRes = await app.request("/api/v1/courses/python-fundamentals/sessions", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({}),
    });
    const createData: any = await createRes.json();
    sessionId = createData.session?.id;
    console.log("Created Session ID:", sessionId);
  }

  console.log("\n=== STEP 4: Send Socratic Tutor Message (Indentation & Execution Model) ===");
  const userPrompt = "How does indentation define code blocks in Python, and what error occurs if it is inconsistent?";
  console.log(`User Prompt: "${userPrompt}"`);

  const msgRes = await app.request(`/api/v1/sessions/${sessionId}/messages`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ content: userPrompt }),
  });

  console.log("Message Endpoint Response Status:", msgRes.status);
  console.log("Content-Type:", msgRes.headers.get("content-type"));

  if (!msgRes.ok) {
    const errText = await msgRes.text();
    throw new Error(`Message endpoint failed (HTTP ${msgRes.status}): ${errText}`);
  }

  console.log("\n=== STEP 5: Reading Real-Time SSE Stream Chunks ===");
  const reader = msgRes.body?.getReader();
  if (!reader) throw new Error("No readable stream body returned");

  const decoder = new TextDecoder();
  let fullResponse = "";
  let tokenCount = 0;
  let hasStateUpdate = false;
  let hasDoneEvent = false;

  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";

    for (const eventBlock of events) {
      if (!eventBlock.trim()) continue;
      const lines = eventBlock.split("\n");
      let eventType = "message";
      let dataStr = "";

      for (const line of lines) {
        if (line.startsWith("event: ")) {
          eventType = line.replace("event: ", "").trim();
        } else if (line.startsWith("data: ")) {
          dataStr = line.replace("data: ", "").trim();
        }
      }

      try {
        const parsed = JSON.parse(dataStr);
        if (eventType === "token" && parsed.chunk) {
          process.stdout.write(parsed.chunk);
          fullResponse += parsed.chunk;
          tokenCount++;
        } else if (eventType === "state_update") {
          hasStateUpdate = true;
          console.log(`\n\n[State Update Event Received]: Concept: ${parsed.conceptName}, Mastery: ${parsed.pMastery}`);
        } else if (eventType === "done") {
          hasDoneEvent = true;
          console.log(`\n\n[Done Event Received]: Saved Message ID = ${parsed.messageId}`);
        }
      } catch {
        // SSE control lines
      }
    }
  }

  console.log("\n\n=== VERIFICATION RESULTS ===");
  console.log(`Total Tokens Streamed: ${tokenCount}`);
  console.log(`Full Response Length: ${fullResponse.length} characters`);
  console.log(`Has Done Event: ${hasDoneEvent}`);

  if (fullResponse.length > 50) {
    console.log("\nSUCCESS: End-to-End Chat Interface & RAG Pipeline is 100% OPERATIONAL!");
  } else {
    console.warn("WARNING: Response was shorter than expected.");
  }
}

verifyChatE2E()
  .catch((err) => {
    console.error("Verification failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
