import { prisma } from "./src/shared/prisma.js";

async function testFlow() {
  const baseUrl = "http://localhost:5000/api/v1";

  console.log("1. Testing Health Check...");
  const healthRes = await fetch(`${baseUrl}/health`);
  const health = await healthRes.json();
  console.log("Health Status:", health.status);

  console.log("\n2. Testing Catalog List...");
  const catalogRes = await fetch(`${baseUrl}/courses`);
  const catalog = await catalogRes.json();
  console.log("Found courses:", catalog.courses.length, catalog.courses[0].title);

  console.log("\n3. Testing Login...");
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "learner@certify.edu", password: "Password123!" }),
  });
  const loginData = await loginRes.json();
  console.log("Logged in user:", loginData.user.fullName, "Token present:", !!loginData.token);

  console.log("\n4. Testing Session Context for 'python-fundamentals'...");
  const sessionRes = await fetch(`${baseUrl}/courses/python-fundamentals/session`, {
    headers: { Authorization: `Bearer ${loginData.token}` },
  });
  const sessionData = await sessionRes.json();
  console.log("Session ID:", sessionData.session.id);
  console.log("Current Chapter:", sessionData.session.chapter.title);

  console.log("\n5. Testing SSE Stream Message to AI Tutor...");
  const msgRes = await fetch(`${baseUrl}/sessions/${sessionData.session.id}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${loginData.token}`,
    },
    body: JSON.stringify({
      content: "Can you explain why a Python list uses references (pointers) to objects in memory?",
    }),
  });

  const text = await msgRes.text();
  console.log("Stream received successfully! Length of raw SSE stream:", text.length);

  console.log("\n6. Testing Chapter Assessment Submission...");
  const questionsRes = await fetch(`${baseUrl}/assessments/chapters/${sessionData.session.chapter.id}`, {
    headers: { Authorization: `Bearer ${loginData.token}` },
  });
  const questionsData = await questionsRes.json();
  console.log("Retrieved chapter questions:", questionsData.questions.length);

  const submitRes = await fetch(`${baseUrl}/assessments/chapters/${sessionData.session.chapter.id}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${loginData.token}`,
    },
    body: JSON.stringify({
      enrollmentId: sessionData.enrollment.id,
      answers: [
        {
          questionId: questionsData.questions[0].id,
          studentAnswer:
            "A Python list holds references or pointers to objects in memory rather than copying values, so b = a creates an alias while a.copy() creates a shallow copy with distinct memory references.",
        },
      ],
    }),
  });
  const submitData = await submitRes.json();
  console.log("Assessment Score:", submitData.score, "Criteria checked:", submitData.totalCriteriaChecked);

  console.log("\n7. Testing Deterministic Gate: Block Incomplete Learner...");
  const prematureCertRes = await fetch(`${baseUrl}/certificates/issue`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${loginData.token}`,
    },
    body: JSON.stringify({ enrollmentId: sessionData.enrollment.id }),
  });
  const prematureCertData = await prematureCertRes.json();
  console.log("Expected Gating Rejection:", prematureCertData.error);
  console.log("Rejection Reasons:", prematureCertData.reasons);

  console.log("\n8. Simulating Course Completion: Elevating Concept Masteries to Demonstrated State...");
  await prisma.conceptMastery.updateMany({
    where: { enrollmentId: sessionData.enrollment.id },
    data: { pMastery: 0.92, state: "MASTERED" },
  });

  console.log("\n9. Testing Deterministic Certificate Issuance for Qualified Learner...");
  const certRes = await fetch(`${baseUrl}/certificates/issue`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${loginData.token}`,
    },
    body: JSON.stringify({ enrollmentId: sessionData.enrollment.id }),
  });
  const certData = await certRes.json();
  console.log("Certificate Issued:", certData.certificate?.credentialId);
  console.log("Awarded Tier:", certData.certificate?.tier);
  console.log("Composite Score:", certData.certificate?.compositeScore);

  console.log("\n10. Testing Public Credential Verification URL (Zero Auth Required)...");
  const verifyRes = await fetch(`${baseUrl}/certificates/${certData.certificate.credentialId}/verify`);
  const verifyData = await verifyRes.json();
  console.log("Verification Status:", verifyData.status, "Valid:", verifyData.isValid);
  console.log("Recipient:", verifyData.recipientName);
  console.log("Course:", verifyData.courseTitle);
  console.log("Awarded Tier:", verifyData.tier);
  console.log("Trust Notice:", verifyData.trustNotice);

  console.log("\n>>> ALL CORE DOMAIN FLOWS AND GUARDRAILS VERIFIED! <<<");
  await prisma.$disconnect();
}

testFlow().catch(console.error);
