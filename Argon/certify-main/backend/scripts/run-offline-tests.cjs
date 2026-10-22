#!/usr/bin/env node
/**
 * Offline TypeScript Compiler & Test Runner for CERTIFY
 * Uses system-installed /usr/share/nodejs/@babel/core + @babel/preset-typescript
 * and Node v18.20.4 + Python 3.11 to compile all backend TypeScript files and run
 * the complete unit, security (IDOR), sandbox, and end-to-end integration test suite.
 */
const fs = require("fs");
const path = require("path");
const babel = require("/usr/share/nodejs/@babel/core");

const backendRoot = path.resolve(__dirname, "..");
const srcDir = path.join(backendRoot, "src");
const outDir = "/tmp/certify-offline-dist";
const nmDir = path.join(outDir, "node_modules");

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(nmDir, { recursive: true });

function writePkg(name, code) {
  const pkgPath = path.join(nmDir, name);
  fs.mkdirSync(pkgPath, { recursive: true });
  fs.writeFileSync(
    path.join(pkgPath, "package.json"),
    JSON.stringify({ name, version: "1.0.0", main: "index.js" }, null, 2)
  );
  fs.writeFileSync(path.join(pkgPath, "index.js"), code);
}

writePkg(
  "dotenv",
  `module.exports = { config: () => ({ parsed: {} }), default: { config: () => ({ parsed: {} }) } };`
);

writePkg(
  "bcryptjs",
  `const crypto = require("crypto");
const bcrypt = {
  async hash(pw) {
    const salt = crypto.randomBytes(8).toString("hex");
    const derived = crypto.scryptSync(pw, salt, 32).toString("hex");
    return \`scrypt$\${salt}$\${derived}\`;
  },
  async compare(pw, hash) {
    if (!hash || !hash.startsWith("scrypt$")) return false;
    const [, salt, key] = hash.split("$");
    const derived = crypto.scryptSync(pw, salt, 32).toString("hex");
    return derived === key;
  }
};
module.exports = bcrypt;
module.exports.default = bcrypt;`
);

writePkg(
  "jsonwebtoken",
  `const crypto = require("crypto");
function b64u(str) { return Buffer.from(str).toString("base64url"); }
const jwt = {
  sign(payload, secret) {
    const header = b64u(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const body = b64u(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) }));
    const sig = crypto.createHmac("sha256", secret).update(\`\${header}.\${body}\`).digest("base64url");
    return \`\${header}.\${body}.\${sig}\`;
  },
  verify(token, secret) {
    const parts = String(token).split(".");
    if (parts.length !== 3) throw new Error("Malformed token");
    const [header, body, sig] = parts;
    const expected = crypto.createHmac("sha256", secret).update(\`\${header}.\${body}\`).digest("base64url");
    if (sig !== expected) throw new Error("Invalid signature");
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  }
};
module.exports = jwt;
module.exports.default = jwt;`
);

writePkg(
  "zod",
  `class ZodError extends Error {
  constructor(issues) {
    super("Validation failed");
    this.errors = issues;
  }
}
function makeType(validator) {
  const api = {
    _validate: validator,
    optional() {
      return makeType((val, path) => (val === undefined ? undefined : validator(val, path)));
    },
    default(defVal) {
      return makeType((val, path) => (val === undefined ? defVal : validator(val, path)));
    },
    trim() {
      return makeType((val, path) => {
        const v = validator(val, path);
        return typeof v === "string" ? v.trim() : v;
      });
    },
    toLowerCase() {
      return makeType((val, path) => {
        const v = validator(val, path);
        return typeof v === "string" ? v.toLowerCase() : v;
      });
    },
    int() { return api; },
    min(n, msg) {
      return makeType((val, path) => {
        const v = validator(val, path);
        if (v === undefined) return v;
        if (typeof v === "string" && v.length < n) throw new ZodError([{ path, message: msg || "Too short" }]);
        if (typeof v === "number" && v < n) throw new ZodError([{ path, message: msg || "Too small" }]);
        if (Array.isArray(v) && v.length < n) throw new ZodError([{ path, message: msg || "Too few items" }]);
        return v;
      });
    },
    max(n, msg) {
      return makeType((val, path) => {
        const v = validator(val, path);
        if (v === undefined) return v;
        if (typeof v === "string" && v.length > n) throw new ZodError([{ path, message: msg || "Too long" }]);
        if (typeof v === "number" && v > n) throw new ZodError([{ path, message: msg || "Too large" }]);
        if (Array.isArray(v) && v.length > n) throw new ZodError([{ path, message: msg || "Too many items" }]);
        return v;
      });
    },
    email(msg) {
      return makeType((val, path) => {
        const v = validator(val, path);
        if (typeof v !== "string" || !v.includes("@")) throw new ZodError([{ path, message: msg || "Invalid email" }]);
        return v;
      });
    },
    parse(val) { return validator(val, []); },
    safeParse(val) {
      try { return { success: true, data: validator(val, []) }; }
      catch (err) { return { success: false, error: err }; }
    }
  };
  return api;
}
const z = {
  ZodError,
  string: () => makeType((val, p) => {
    if (typeof val !== "string") throw new ZodError([{ path: p, message: "Expected string" }]);
    return val;
  }),
  number: () => makeType((val, p) => {
    if (typeof val !== "number" || Number.isNaN(val)) throw new ZodError([{ path: p, message: "Expected number" }]);
    return val;
  }),
  boolean: () => makeType((val, p) => {
    if (typeof val !== "boolean") throw new ZodError([{ path: p, message: "Expected boolean" }]);
    return val;
  }),
  enum: (values) => makeType((val, p) => {
    if (!values.includes(val)) throw new ZodError([{ path: p, message: "Invalid enum value" }]);
    return val;
  }),
  array: (itemType) => makeType((val, p) => {
    if (!Array.isArray(val)) throw new ZodError([{ path: p, message: "Expected array" }]);
    return val.map((item, idx) => itemType._validate(item, [...p, idx]));
  }),
  object: (shape) => makeType((val, p) => {
    if (typeof val !== "object" || val === null) throw new ZodError([{ path: p, message: "Expected object" }]);
    const out = {};
    for (const [k, schema] of Object.entries(shape)) {
      out[k] = schema._validate(val[k], [...p, k]);
    }
    return out;
  })
};
module.exports = { z, ZodError };`
);

writePkg(
  "cors",
  `module.exports = function cors() {
  return (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  };
};
module.exports.default = module.exports;`
);

writePkg(
  "express",
  `const http = require("http");
const url = require("url");

function matchPath(pattern, actual) {
  const pParts = pattern.split("/").filter(Boolean);
  const aParts = actual.split("/").filter(Boolean);
  if (pParts.length !== aParts.length) return null;
  const params = {};
  for (let i = 0; i < pParts.length; i++) {
    if (pParts[i].startsWith(":")) {
      params[pParts[i].slice(1)] = decodeURIComponent(aParts[i]);
    } else if (pParts[i] !== aParts[i]) {
      return null;
    }
  }
  return params;
}

function createRouter() {
  const stack = [];
  const router = function(req, res, done) {
    let idx = 0;
    function next(err) {
      if (err) return done(err);
      const layer = stack[idx++];
      if (!layer) return done();
      if (layer.type === "mw") {
        if (layer.prefix === "/" || req.path === layer.prefix || req.path.startsWith(layer.prefix + "/")) {
          const prevPath = req.path;
          if (layer.prefix !== "/") {
            req.path = req.path.slice(layer.prefix.length) || "/";
          }
          return layer.fn(req, res, (e) => {
            req.path = prevPath;
            next(e);
          });
        }
        return next();
      }
      if (layer.type === "route") {
        if (layer.method !== req.method) return next();
        const params = matchPath(layer.path, req.path);
        if (!params) return next();
        req.params = { ...req.params, ...params };
        let hIdx = 0;
        function nextHandler(e) {
          if (e) return next(e);
          const h = layer.handlers[hIdx++];
          if (!h) return;
          try {
            const maybePromise = h(req, res, nextHandler);
            if (maybePromise && typeof maybePromise.catch === "function") {
              maybePromise.catch(nextHandler);
            }
          } catch (syncErr) {
            nextHandler(syncErr);
          }
        }
        return nextHandler();
      }
    }
    next();
  };
  router.disable = function() {};
  router.use = function(arg1, arg2) {
    if (typeof arg1 === "string") {
      stack.push({ type: "mw", prefix: arg1, fn: arg2 });
    } else {
      stack.push({ type: "mw", prefix: "/", fn: arg1 });
    }
  };
  for (const m of ["get", "post", "put", "delete", "patch"]) {
    router[m] = function(routePath, ...handlers) {
      stack.push({ type: "route", method: m.toUpperCase(), path: routePath, handlers });
    };
  }
  router.listen = function(port, cb) {
    const srv = http.createServer((req, res) => {
      const parsed = url.parse(req.url || "/", true);
      req.path = parsed.pathname || "/";
      req.query = parsed.query || {};
      req.params = {};
      req.ip = "127.0.0.1";
      res.statusCode = 200;
      res.status = function(code) {
        res.statusCode = code;
        return res;
      };
      res.setHeader = res.setHeader.bind(res);
      res.json = function(obj) {
        if (!res.headersSent) res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(obj));
        return res;
      };
      res.flushHeaders = function() {};
      let rawBody = "";
      req.on("data", (c) => (rawBody += c));
      req.on("end", () => {
        try {
          req.body = rawBody ? JSON.parse(rawBody) : {};
        } catch {
          req.body = {};
        }
        router(req, res, (err) => {
          if (err) {
            res.status(err.statusCode || 500).json({ error: err.message });
          } else if (!res.writableEnded) {
            res.status(404).json({ error: "Not Found" });
          }
        });
      });
    });
    return srv.listen(port, cb);
  };
  return router;
}

function express() { return createRouter(); }
express.Router = createRouter;
express.json = () => (req, res, next) => next();
module.exports = express;
module.exports.Router = createRouter;
module.exports.default = express;`
);

// 6. @prisma/client matching exact backend/prisma/schema.prisma models
writePkg(
  "@prisma/client",
  `const crypto = require("crypto");
function uuid() { return crypto.randomUUID(); }

const courseId = "course-py-1";
const cvId = "cv-py-1";
const modId = "mod-py-1";

const db = {
  users: [],
  courses: [{
    id: courseId,
    slug: "python-fundamentals",
    title: "Python Fundamentals",
    summary: "Master Python runtime semantics, memory references, and generators.",
    description: "Flagship course on Python 3 memory model, mutability, closures, and lazy generators.",
    status: "PUBLISHED",
    createdAt: new Date(),
    updatedAt: new Date()
  }],
  courseVersions: [{
    id: cvId,
    courseId,
    versionNumber: "1.0.0",
    changelog: "Initial V1 release",
    isActive: true,
    createdAt: new Date()
  }],
  modules: [{
    id: modId,
    courseVersionId: cvId,
    title: "Core Python Execution & Memory Model",
    sequenceOrder: 1,
    createdAt: new Date()
  }],
  chapters: [
    {
      id: "chap-1",
      moduleId: modId,
      title: "Variables, Object References & Mutability",
      sequenceOrder: 1,
      teachingContent: "Python variables bind names to heap objects via references.",
      createdAt: new Date()
    },
    {
      id: "chap-2",
      moduleId: modId,
      title: "Generators, Yield & Lazy Iteration",
      sequenceOrder: 2,
      teachingContent: "Generators suspend execution frames using yield for O(1) memory iteration.",
      createdAt: new Date()
    }
  ],
  concepts: [
    {
      id: "concept-1",
      chapterId: "chap-1",
      slug: "variables-and-memory",
      name: "Variables & Memory References",
      description: "Explain how Python variables bind names to heap objects.",
      sequenceOrder: 1,
      createdAt: new Date()
    },
    {
      id: "concept-2",
      chapterId: "chap-1",
      slug: "mutability-and-collections",
      name: "Mutability & Collection Semantics",
      description: "Distinguish in-place list/dict mutation from immutable tuples.",
      sequenceOrder: 2,
      createdAt: new Date()
    },
    {
      id: "concept-3",
      chapterId: "chap-2",
      slug: "generators-and-comprehensions",
      name: "Generators & Lazy Evaluation",
      description: "Use yield to suspend generator state with O(1) memory complexity.",
      sequenceOrder: 1,
      createdAt: new Date()
    }
  ],
  rubrics: [
    { id: "rub-1", conceptId: "concept-1", title: "Memory Reference Rubric", createdAt: new Date() },
    { id: "rub-2", conceptId: "concept-2", title: "Mutability Rubric", createdAt: new Date() },
    { id: "rub-3", conceptId: "concept-3", title: "Generators Rubric", createdAt: new Date() }
  ],
  rubricCriteria: [
    { id: "crit-1", rubricId: "rub-1", criterionStatement: "Explains variable name binding to heap object references.", weight: 1.0, tierRequired: "EASY", createdAt: new Date() },
    { id: "crit-2", rubricId: "rub-2", criterionStatement: "Contrasts in-place mutable containers with immutable types.", weight: 1.0, tierRequired: "EASY", createdAt: new Date() },
    { id: "crit-3", rubricId: "rub-3", criterionStatement: "Explains yield state suspension and O(1) lazy evaluation.", weight: 1.0, tierRequired: "EASY", createdAt: new Date() }
  ],
  questions: [
    { id: "q-1", chapterId: "chap-1", questionType: "EXPLAIN", prompt: "Explain how Python variables reference objects in heap memory and how mutability works.", tier: "EASY", parameters: null, createdAt: new Date() },
    { id: "q-2", chapterId: "chap-2", questionType: "EXPLAIN", prompt: "Explain how Python generators use yield for lazy evaluation.", tier: "EASY", parameters: null, createdAt: new Date() },
    { id: "q-viva", chapterId: "chap-2", questionType: "VIVA", prompt: "Defend your practical implementation's memory and time complexity.", tier: "MEDIUM", parameters: null, createdAt: new Date() }
  ],
  enrollments: [],
  learningSessions: [],
  chatMessages: [],
  conceptMasteries: [],
  masteryEvidences: [],
  assessmentAttempts: [],
  assessmentAnswers: [],
  rubricEvaluations: [],
  certificates: []
};

function hydrateConcept(c) {
  if (!c) return null;
  const ch = db.chapters.find((x) => x.id === c.chapterId);
  const rubrics = db.rubrics
    .filter((r) => r.conceptId === c.id)
    .map((r) => ({
      ...r,
      criteria: db.rubricCriteria.filter((cr) => cr.rubricId === r.id)
    }));
  return { ...c, chapter: ch, rubrics };
}

function hydrateChapter(ch) {
  if (!ch) return null;
  const mod = db.modules.find((m) => m.id === ch.moduleId);
  const cv = mod ? db.courseVersions.find((v) => v.id === mod.courseVersionId) : null;
  const course = cv ? db.courses.find((c) => c.id === cv.courseId) : null;
  return {
    ...ch,
    module: mod ? {
      ...mod,
      courseVersion: cv ? {
        ...cv,
        course,
        modules: db.modules.filter((m) => m.courseVersionId === cv.id).map((m) => ({
          ...m,
          chapters: db.chapters.filter((c) => c.moduleId === m.id).sort((a, b) => a.sequenceOrder - b.sequenceOrder)
        }))
      } : null
    } : null,
    concepts: db.concepts.filter((c) => c.chapterId === ch.id).sort((a, b) => a.sequenceOrder - b.sequenceOrder).map(hydrateConcept),
    questions: db.questions.filter((q) => q.chapterId === ch.id)
  };
}

function hydrateCourse(course) {
  if (!course) return null;
  const versions = db.courseVersions
    .filter((v) => v.courseId === course.id && v.isActive)
    .map((v) => ({
      ...v,
      course,
      modules: db.modules
        .filter((m) => m.courseVersionId === v.id)
        .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
        .map((m) => ({
          ...m,
          chapters: db.chapters
            .filter((ch) => ch.moduleId === m.id)
            .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
            .map(hydrateChapter)
        }))
    }));
  return { ...course, versions };
}

function hydrateEnrollment(e) {
  if (!e) return null;
  const user = db.users.find((u) => u.id === e.userId);
  const cv = db.courseVersions.find((v) => v.id === e.courseVersionId);
  const course = cv ? hydrateCourse(db.courses.find((c) => c.id === cv.courseId)) : null;
  const courseVersion = cv ? { ...cv, course, modules: course.versions[0].modules } : null;
  const conceptMasteries = db.conceptMasteries
    .filter((m) => m.enrollmentId === e.id)
    .map((m) => ({
      ...m,
      concept: hydrateConcept(db.concepts.find((c) => c.id === m.conceptId)),
      evidences: db.masteryEvidences.filter((ev) => ev.conceptMasteryId === m.id)
    }));
  const assessments = db.assessmentAttempts
    .filter((a) => a.enrollmentId === e.id)
    .map((a) => ({
      ...a,
      answers: db.assessmentAnswers.filter((ans) => ans.attemptId === a.id)
    }));
  const sessions = db.learningSessions
    .filter((s) => s.enrollmentId === e.id)
    .map((s) => ({
      ...s,
      chapter: hydrateChapter(db.chapters.find((ch) => ch.id === s.chapterId)),
      messages: db.chatMessages.filter((msg) => msg.sessionId === s.id).sort((x, y) => x.createdAt - y.createdAt)
    }));
  const certificate = db.certificates.find((c) => c.enrollmentId === e.id) || null;
  return {
    ...e,
    user,
    courseVersion,
    conceptMasteries,
    assessments,
    sessions,
    certificate
  };
}

class PrismaClient {
  constructor() {
    this.user = {
      findUnique: async ({ where }) => {
        const u = db.users.find((x) => (where.id && x.id === where.id) || (where.email && x.email === where.email)) || null;
        if (!u) return null;
        return { ...u, enrollments: db.enrollments.filter((e) => e.userId === u.id).map(hydrateEnrollment) };
      },
      create: async ({ data }) => {
        const u = { id: uuid(), role: "STUDENT", createdAt: new Date(), updatedAt: new Date(), ...data };
        db.users.push(u);
        return u;
      }
    };
    this.course = {
      findMany: async () => db.courses.filter((c) => c.status === "PUBLISHED").map(hydrateCourse),
      findUnique: async ({ where }) => {
        const c = db.courses.find((x) => (where.slug && x.slug === where.slug) || (where.id && x.id === where.id));
        return hydrateCourse(c);
      }
    };
    this.chapter = {
      findUnique: async ({ where }) => hydrateChapter(db.chapters.find((c) => c.id === where.id))
    };
    this.concept = {
      findUnique: async ({ where }) => hydrateConcept(db.concepts.find((c) => (where.id && c.id === where.id) || (where.slug && c.slug === where.slug)))
    };
    this.question = {
      findMany: async ({ where }) => db.questions.filter((q) => !where?.chapterId || q.chapterId === where.chapterId),
      findUnique: async ({ where }) => db.questions.find((q) => q.id === where.id) || null,
      findFirst: async (args) => {
        const where = args?.where;
        return db.questions.find((q) => !where?.questionType || q.questionType === where.questionType) || db.questions[0] || null;
      }
    };
    this.enrollment = {
      findMany: async ({ where }) => db.enrollments.filter((e) => !where?.userId || e.userId === where.userId).map(hydrateEnrollment),
      findUnique: async ({ where }) => {
        let e = null;
        if (where.id) e = db.enrollments.find((x) => x.id === where.id);
        else if (where.userId_courseVersionId) {
          const { userId, courseVersionId } = where.userId_courseVersionId;
          e = db.enrollments.find((x) => x.userId === userId && x.courseVersionId === courseVersionId);
        }
        return hydrateEnrollment(e);
      },
      create: async ({ data }) => {
        const e = { id: uuid(), status: "ACTIVE", currentTier: "EASY", enrolledAt: new Date(), completedAt: null, ...data };
        db.enrollments.push(e);
        return hydrateEnrollment(e);
      },
      update: async ({ where, data }) => {
        const e = db.enrollments.find((x) => x.id === where.id);
        if (e) Object.assign(e, data);
        return hydrateEnrollment(e);
      }
    };
    this.conceptMastery = {
      findMany: async ({ where }) =>
        db.conceptMasteries
          .filter((m) => (!where?.enrollmentId || m.enrollmentId === where.enrollmentId) && (!where?.conceptId?.in || where.conceptId.in.includes(m.conceptId)))
          .map((m) => ({
            ...m,
            concept: hydrateConcept(db.concepts.find((c) => c.id === m.conceptId)),
            evidences: db.masteryEvidences.filter((ev) => ev.conceptMasteryId === m.id)
          })),
      findUnique: async ({ where }) => {
        const { enrollmentId, conceptId } = where.enrollmentId_conceptId;
        const m = db.conceptMasteries.find((x) => x.enrollmentId === enrollmentId && x.conceptId === conceptId) || null;
        if (!m) return null;
        return { ...m, concept: hydrateConcept(db.concepts.find((c) => c.id === m.conceptId)) };
      },
      create: async ({ data }) => {
        const existing = db.conceptMasteries.find((x) => x.enrollmentId === data.enrollmentId && x.conceptId === data.conceptId);
        if (existing) return existing;
        const m = { id: uuid(), pMastery: 0.15, confidence: 0.2, state: "UNENCOUNTERED", remediationCycles: 0, lastAssessedAt: null, ...data };
        db.conceptMasteries.push(m);
        return m;
      },
      update: async ({ where, data }) => {
        const m = db.conceptMasteries.find((x) => x.id === where.id || (where.enrollmentId_conceptId && x.enrollmentId === where.enrollmentId_conceptId.enrollmentId && x.conceptId === where.enrollmentId_conceptId.conceptId));
        if (m) {
          if (data.remediationCycles?.increment) {
            m.remediationCycles += data.remediationCycles.increment;
            delete data.remediationCycles;
          }
          Object.assign(m, data);
        }
        return m;
      }
    };
    this.masteryEvidence = {
      create: async ({ data }) => {
        const ev = { id: uuid(), createdAt: new Date(), ...data };
        db.masteryEvidences.push(ev);
        return ev;
      }
    };
    this.learningSession = {
      findFirst: async ({ where }) => {
        const s = db.learningSessions.find((x) => (!where.enrollmentId || x.enrollmentId === where.enrollmentId) && (where.isActive === undefined || x.isActive === where.isActive));
        if (!s) return null;
        return {
          ...s,
          chapter: hydrateChapter(db.chapters.find((c) => c.id === s.chapterId)),
          enrollment: hydrateEnrollment(db.enrollments.find((e) => e.id === s.enrollmentId)),
          messages: db.chatMessages.filter((m) => m.sessionId === s.id).sort((a, b) => a.createdAt - b.createdAt)
        };
      },
      findUnique: async ({ where }) => {
        const s = db.learningSessions.find((x) => x.id === where.id);
        if (!s) return null;
        return {
          ...s,
          chapter: hydrateChapter(db.chapters.find((c) => c.id === s.chapterId)),
          enrollment: hydrateEnrollment(db.enrollments.find((e) => e.id === s.enrollmentId)),
          messages: db.chatMessages.filter((m) => m.sessionId === s.id).sort((a, b) => a.createdAt - b.createdAt)
        };
      },
      create: async ({ data }) => {
        const s = { id: uuid(), phase: "TEACHING", isActive: true, createdAt: new Date(), updatedAt: new Date(), ...data };
        db.learningSessions.push(s);
        return {
          ...s,
          chapter: hydrateChapter(db.chapters.find((c) => c.id === s.chapterId)),
          messages: []
        };
      },
      update: async ({ where, data }) => {
        const s = db.learningSessions.find((x) => x.id === where.id);
        if (s) Object.assign(s, data, { updatedAt: new Date() });
        return {
          ...s,
          chapter: hydrateChapter(db.chapters.find((c) => c.id === s.chapterId))
        };
      }
    };
    this.chatMessage = {
      create: async ({ data }) => {
        const m = { id: uuid(), role: "user", metadata: null, createdAt: new Date(), ...data };
        db.chatMessages.push(m);
        return m;
      },
      findMany: async ({ where }) => db.chatMessages.filter((m) => m.sessionId === where.sessionId).sort((a, b) => a.createdAt - b.createdAt)
    };
    this.assessmentAttempt = {
      create: async ({ data }) => {
        const a = { id: uuid(), status: "IN_PROGRESS", score: null, createdAt: new Date(), completedAt: null, ...data };
        db.assessmentAttempts.push(a);
        return { ...a, answers: [] };
      },
      findFirst: async ({ where }) => {
        const a = db.assessmentAttempts.find(
          (x) =>
            (!where.enrollmentId || x.enrollmentId === where.enrollmentId) &&
            (!where.assessmentType || x.assessmentType === where.assessmentType) &&
            (!where.status || x.status === where.status)
        );
        if (!a) return null;
        return { ...a, answers: db.assessmentAnswers.filter((ans) => ans.attemptId === a.id) };
      },
      update: async ({ where, data }) => {
        const a = db.assessmentAttempts.find((x) => x.id === where.id);
        if (a) Object.assign(a, data);
        return a;
      }
    };
    this.assessmentAnswer = {
      create: async ({ data }) => {
        const ans = { id: uuid(), createdAt: new Date(), ...data };
        db.assessmentAnswers.push(ans);
        return ans;
      },
      findMany: async ({ where }) => db.assessmentAnswers.filter((a) => a.attemptId === where.attemptId).sort((x, y) => x.createdAt - y.createdAt)
    };
    this.rubricEvaluation = {
      create: async ({ data }) => {
        const r = { id: uuid(), createdAt: new Date(), ...data };
        db.rubricEvaluations.push(r);
        return r;
      }
    };
    this.certificate = {
      findUnique: async ({ where }) => {
        const c = db.certificates.find((x) => (where.credentialId && x.credentialId === where.credentialId) || (where.id && x.id === where.id));
        if (!c) return null;
        return { ...c, enrollment: hydrateEnrollment(db.enrollments.find((e) => e.id === c.enrollmentId)) };
      },
      create: async ({ data }) => {
        const c = { id: uuid(), status: "VALID", issuedAt: new Date(), ...data };
        db.certificates.push(c);
        return c;
      },
      update: async ({ where, data }) => {
        const c = db.certificates.find((x) => (where.credentialId && x.credentialId === where.credentialId) || (where.id && x.id === where.id));
        if (c) Object.assign(c, data);
        return c;
      }
    };
  }
  async $transaction(fn) { return fn(this); }
  async $disconnect() {}
}
module.exports = { PrismaClient };`
);

writePkg(
  "vitest",
  `const suites = [];
let currentSuite = null;
function describe(name, fn) {
  const prev = currentSuite;
  const suite = { name, tests: [] };
  suites.push(suite);
  currentSuite = suite;
  fn();
  currentSuite = prev;
}
function it(name, fn) {
  if (currentSuite) currentSuite.tests.push({ name, fn });
}
function beforeAll(fn) {
  if (currentSuite) currentSuite.beforeAll = fn;
}
function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) throw new Error(\`Expected \${JSON.stringify(actual)} to be \${JSON.stringify(expected)}\`);
    },
    toBeDefined() {
      if (actual === undefined || actual === null) throw new Error(\`Expected value to be defined, got \${actual}\`);
    },
    toBeGreaterThan(n) {
      if (!(actual > n)) throw new Error(\`Expected \${actual} > \${n}\`);
    },
    toBeGreaterThanOrEqual(n) {
      if (!(actual >= n)) throw new Error(\`Expected \${actual} >= \${n}\`);
    },
    toBeLessThan(n) {
      if (!(actual < n)) throw new Error(\`Expected \${actual} < \${n}\`);
    },
    toBeLessThanOrEqual(n) {
      if (!(actual <= n)) throw new Error(\`Expected \${actual} <= \${n}\`);
    },
    toBeCloseTo(n, digits = 2) {
      const diff = Math.abs(actual - n);
      const tol = Math.pow(10, -digits) / 2;
      if (diff > tol) throw new Error(\`Expected \${actual} to be close to \${n}\`);
    },
    toContain(sub) {
      if (!String(actual).includes(sub)) throw new Error(\`Expected "\${actual}" to contain "\${sub}"\`);
    },
    not: {
      toBe(expected) {
        if (actual === expected) throw new Error(\`Expected \${actual} not to be \${expected}\`);
      }
    }
  };
}
module.exports = { describe, it, expect, beforeAll, __suites: suites };`
);


const EXPLICIT_TS_FILES = [
  "config/index.ts",
  "shared/prisma.ts",
  "shared/logger.ts",
  "shared/middleware/auth.ts",
  "shared/middleware/rateLimit.ts",
  "modules/auth/auth.controller.ts",
  "modules/auth/auth.routes.ts",
  "modules/courses/courses.controller.ts",
  "modules/courses/courses.routes.ts",
  "modules/mastery/bkt.ts",
  "modules/mastery/bkt.test.ts",
  "modules/ai/ai.provider.ts",
  "modules/sandbox/sandbox.service.ts",
  "modules/sandbox/sandbox.routes.ts",
  "modules/sessions/sessions.controller.ts",
  "modules/sessions/sessions.routes.ts",
  "modules/assessment/assessment.controller.ts",
  "modules/assessment/assessment.routes.ts",
  "modules/certificates/crypto.service.ts",
  "modules/certificates/certificates.controller.ts",
  "modules/certificates/certificates.routes.ts",
  "app.ts",
  "app.test.ts",
  "server.ts"
];
function compileAll(fromDir, toDir) {
  for (const rel of EXPLICIT_TS_FILES) {
    const fullFrom = path.join(fromDir, rel);
    const fullTo = path.join(toDir, rel).replace(/\.ts$/, ".js");
    fs.mkdirSync(path.dirname(fullTo), { recursive: true });
    const src = fs.readFileSync(fullFrom, "utf8");
    const transformed = babel.transformSync(src, {
      filename: fullFrom,
      presets: ["/usr/share/nodejs/@babel/preset-typescript"],
      plugins: ["/usr/share/nodejs/@babel/plugin-transform-modules-commonjs"],
    });
    fs.writeFileSync(fullTo, transformed.code);
  }
}

compileAll(srcDir, path.join(outDir, "src"));

process.env.NODE_PATH = nmDir;
require("module").Module._initPaths();

require(path.join(outDir, "src/modules/mastery/bkt.test.js"));
require(path.join(outDir, "src/app.test.js"));

const vitest = require("vitest");

(async () => {
  let passed = 0;
  let failed = 0;
  console.log("==============================================================");
  console.log("CERTIFY OFFLINE TYPESCRIPT BUILD & AUTOMATED TEST SUITE RUNNER");
  console.log("==============================================================");
  for (const suite of vitest.__suites) {
    console.log(`\nSUITE: ${suite.name}`);
    if (suite.beforeAll) await suite.beforeAll();
    for (const t of suite.tests) {
      const start = Date.now();
      try {
        await t.fn();
        const ms = Date.now() - start;
        console.log(`  [PASS] ${t.name} (${ms}ms)`);
        passed++;
      } catch (err) {
        console.error(`  [FAIL] ${t.name}: ${err.stack || err.message}`);
        failed++;
      }
    }
  }
  console.log("\n==============================================================");
  console.log(`TOTAL SUITES: ${vitest.__suites.length} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==============================================================");
  fs.rmSync(outDir, { recursive: true, force: true });
  process.exit(failed > 0 ? 1 : 0);
})();
