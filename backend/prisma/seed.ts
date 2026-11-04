import bcrypt from "bcryptjs";
import { prisma } from "../src/shared/prisma.js";
import { auth } from "../src/lib/auth.js";

async function main() {
  console.log("Seeding database with flagship course: Python Fundamentals...");

  // 1. Clean existing test data if needed
  await prisma.certificate.deleteMany();
  await prisma.rubricEvaluation.deleteMany();
  await prisma.assessmentAnswer.deleteMany();
  await prisma.assessmentAttempt.deleteMany();
  await prisma.masteryEvidence.deleteMany();
  await prisma.conceptMastery.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.learningSession.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.question.deleteMany();
  await prisma.rubricCriterion.deleteMany();
  await prisma.rubric.deleteMany();
  await prisma.concept.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.module.deleteMany();
  await prisma.courseVersion.deleteMany();
  await prisma.course.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Default Users (Instructor & Student) via Better Auth
  const instructorRes = await auth.api.signUpEmail({
    body: {
      email: "instructor@certify.edu",
      password: "Password123!",
      name: "Dr. Eleanor Vance",
      // @ts-ignore
      fullName: "Dr. Eleanor Vance",
    },
  });

  const studentRes = await auth.api.signUpEmail({
    body: {
      email: "learner@certify.edu",
      password: "Password123!",
      name: "Alex Chen",
      // @ts-ignore
      fullName: "Alex Chen",
    },
  });

  await prisma.user.update({
    where: { email: "instructor@certify.edu" },
    data: { role: "INSTRUCTOR", fullName: "Dr. Eleanor Vance" },
  });

  await prisma.user.update({
    where: { email: "learner@certify.edu" },
    data: { role: "STUDENT", fullName: "Alex Chen" },
  });

  console.log(`Created users: instructor@certify.edu, learner@certify.edu`);

  // 3. Create Course: Python Fundamentals
  const course = await prisma.course.create({
    data: {
      slug: "python-fundamentals",
      title: "Python Fundamentals",
      summary: "Master modern Python through interactive Socratic AI dialogue, conceptual problem-solving, and verified defense.",
      description: "A comprehensive course taking you from foundational syntax through memory-efficient stream processing and architectural design. You will interactively dialogue with your AI tutor, complete structured chapter verifications, and defend your code in a final AI Viva to earn a tiered credential.",
      status: "PUBLISHED",
    },
  });

  const courseVersion = await prisma.courseVersion.create({
    data: {
      courseId: course.id,
      versionNumber: "1.0.0",
      changelog: "Initial release with 8 structured modules and atomic BKT rubrics.",
      isActive: true,
    },
  });

  // 4. Create Modules, Chapters, Concepts, Rubrics & Questions
  const curriculum = [
    {
      moduleTitle: "Module 1: Variables & Control Flow",
      order: 1,
      chapters: [
        {
          title: "Variables, Types, and Mutability",
          order: 1,
          teachingContent: `Variables in Python are references to objects in memory, not typed buckets. Understanding the difference between mutable objects (like lists and dictionaries) and immutable objects (like integers, strings, and tuples) is fundamental to writing bug-free Python.`,
          concepts: [
            {
              slug: "variable-binding",
              name: "Object References and Variable Binding",
              description: "How Python binds variable names to objects in heap memory.",
              criteria: [
                { statement: "Articulates that variables are references (pointers) to objects rather than fixed memory boxes.", weight: 0.5, tier: "EASY" },
                { statement: "Accurately predicts behavior when multiple names reference the same mutable object.", weight: 0.5, tier: "MEDIUM" }
              ]
            },
            {
              slug: "mutability-tradeoffs",
              name: "Mutability vs Immutability",
              description: "Differences in modification, identity (id), and hashability.",
              criteria: [
                { statement: "Correctly identifies lists as mutable and tuples as immutable.", weight: 0.4, tier: "EASY" },
                { statement: "Explains why mutable objects cannot be used as dictionary keys due to hash invariance.", weight: 0.6, tier: "HARD" }
              ]
            }
          ],
          questions: [
            {
              type: "EXPLAIN",
              prompt: "In your own words, explain the difference between `a = [1, 2]; b = a` and `a = [1, 2]; b = a.copy()`. What happens if you modify `a` in both cases?",
              tier: "EASY"
            },
            {
              type: "REASON",
              prompt: "Why does Python disallow mutable objects such as lists from being used as dictionary keys? What problem would occur in hash table lookups?",
              tier: "MEDIUM"
            },
            {
              type: "DEBUG",
              prompt: "Consider `def add_item(item, target_list=[]): target_list.append(item); return target_list`. Why is this pattern dangerous, and how do you fix it?",
              tier: "MEDIUM"
            },
            {
              type: "APPLY",
              prompt: "Write a small snippet that safely swaps two variables without using a temporary variable, and explain why Python's tuple packing allows this.",
              tier: "EASY"
            }
          ]
        },
        {
          title: "Conditionals, Truthiness, and Short-Circuiting",
          order: 2,
          teachingContent: `Python evaluations utilize truthiness values (empty collections and zero evaluate to False). Boolean operators 'and' and 'or' perform short-circuit evaluation, returning the actual operand rather than a strict boolean.`,
          concepts: [
            {
              slug: "short-circuit-evaluation",
              name: "Short-Circuit Logic",
              description: "Evaluation terminates as soon as the outcome is determined.",
              criteria: [
                { statement: "Demonstrates that 'and' and 'or' return operands rather than boolean true/false.", weight: 0.5, tier: "EASY" },
                { statement: "Identifies performance and safety benefits (e.g. avoiding NoneType access).", weight: 0.5, tier: "MEDIUM" }
              ]
            }
          ],
          questions: [
            {
              type: "EXPLAIN",
              prompt: "What is returned by `'apple' and '' or 'default'` and why? Walk through how Python evaluates this step-by-step.",
              tier: "MEDIUM"
            },
            {
              type: "DEBUG",
              prompt: "How does short-circuit evaluation protect against `AttributeError` when checking `if user is not None and user.is_active:`?",
              tier: "EASY"
            }
          ]
        }
      ]
    },
    {
      moduleTitle: "Module 2: Data Structures",
      order: 2,
      chapters: [
        {
          title: "Lists, Sets, and Dictionaries: Time & Space Complexity",
          order: 3,
          teachingContent: `Choosing the right data structure directly impacts algorithmic performance. Lists provide O(1) indexed access and append but O(n) search. Hash sets and dictionaries provide average O(1) membership testing at the cost of memory overhead for open addressing hash tables.`,
          concepts: [
            {
              slug: "hash-table-mechanics",
              name: "Dictionary & Set Hash Mechanics",
              description: "Hash code computation, bucket distribution, collision resolution.",
              criteria: [
                { statement: "Explains that sets provide O(1) membership checks via hashing versus O(n) linear scans in lists.", weight: 0.5, tier: "EASY" },
                { statement: "Identifies memory trade-offs and collision handling in Python's sparse hash table implementation.", weight: 0.5, tier: "HARD" }
              ]
            }
          ],
          questions: [
            {
              type: "REASON",
              prompt: "Imagine you have 5 million email addresses and need to check if incoming emails are already registered. Which data structure do you choose, and what is the time and space trade-off?",
              tier: "MEDIUM"
            },
            {
              type: "COMPARE",
              prompt: "Compare a List and a Set when performing duplicate removal. Does order preservation matter?",
              tier: "EASY"
            }
          ]
        }
      ]
    },
    {
      moduleTitle: "Module 3: Functions, Scope & Closures",
      order: 3,
      chapters: [
        {
          title: "First-Class Functions, Scope (LEGB), and Closures",
          order: 4,
          teachingContent: `In Python, functions are first-class citizens: they can be passed as arguments, returned from functions, and assigned to variables. The LEGB rule governs scope: Local, Enclosing, Global, Built-in. When an inner function references variables in an enclosing scope, a closure is formed.`,
          concepts: [
            {
              slug: "closure-encapsulation",
              name: "Closures and Enclosing Scope",
              description: "Retaining access to free variables in outer lexical environment.",
              criteria: [
                { statement: "Accurately articulates that closures bundle a function with its enclosing lexical environment.", weight: 0.5, tier: "MEDIUM" },
                { statement: "Correctly uses the `nonlocal` keyword to mutate outer state inside a closure.", weight: 0.5, tier: "HARD" }
              ]
            }
          ],
          questions: [
            {
              type: "EXPLAIN",
              prompt: "In your own words, explain how a closure retains state across calls without using a class or global variable.",
              tier: "MEDIUM"
            },
            {
              type: "APPLY",
              prompt: "Write a function `make_multiplier(n)` that returns a closure that multiplies its argument by `n`.",
              tier: "EASY"
            }
          ]
        }
      ]
    },
    {
      moduleTitle: "Module 4: Generators & Stream Processing",
      order: 4,
      chapters: [
        {
          title: "Iterators, Generators, and Lazy Evaluation",
          order: 5,
          teachingContent: `Generators produce items on demand using the 'yield' keyword instead of allocating entire sequences in memory. This enables stream processing of massive datasets with O(1) auxiliary memory footprint.`,
          concepts: [
            {
              slug: "lazy-evaluation",
              name: "Lazy Evaluation and Generator State",
              description: "Suspending and resuming execution frames on demand.",
              criteria: [
                { statement: "Articulates that values are computed lazily on demand rather than upfront.", weight: 0.4, tier: "EASY" },
                { statement: "Contrasts yield (pauses execution frame) with return (terminates frame).", weight: 0.3, tier: "EASY" },
                { statement: "Explains O(1) memory scaling advantages when processing large datasets.", weight: 0.3, tier: "MEDIUM" }
              ]
            }
          ],
          questions: [
            {
              type: "COMPARE",
              prompt: "Why does a generator function processing a 50GB log file consume negligible RAM compared to a function returning a full list?",
              tier: "MEDIUM"
            },
            {
              type: "APPLY",
              prompt: "Write a generator `stream_error_lines(lines)` that yields only lines starting with 'ERROR:'.",
              tier: "EASY"
            }
          ]
        }
      ]
    },
    {
      moduleTitle: "Module 5: Object-Oriented Principles",
      order: 5,
      chapters: [
        {
          title: "Classes, Composition over Inheritance, and Magic Methods",
          order: 6,
          teachingContent: `Python OOP is centered around protocols and dunder methods (__init__, __str__, __repr__, __eq__, __hash__). Favor composition over deep inheritance hierarchies to maintain modularity and avoid tight coupling.`,
          concepts: [
            {
              slug: "composition-over-inheritance",
              name: "Object Composition and Protocols",
              description: "Building flexible architectures by aggregating components.",
              criteria: [
                { statement: "Explains why composition is preferred over inheritance for behavioral reuse.", weight: 0.5, tier: "MEDIUM" },
                { statement: "Implements dunder methods to satisfy Python protocols (__iter__, __len__).", weight: 0.5, tier: "HARD" }
              ]
            }
          ],
          questions: [
            {
              type: "REASON",
              prompt: "What design hazards emerge from deep inheritance hierarchies (e.g., 4+ levels deep), and how does composition solve them?",
              tier: "MEDIUM"
            }
          ]
        }
      ]
    },
    {
      moduleTitle: "Module 6: Error Handling & Context Managers",
      order: 6,
      chapters: [
        {
          title: "Exception Hierarchies and Resource Safety with Context Managers",
          order: 7,
          teachingContent: `The 'with' statement guarantees cleanup of resources (file handles, database connections, sockets) via the context management protocol (__enter__ and __exit__), even if unexpected exceptions occur.`,
          concepts: [
            {
              slug: "context-management-protocol",
              name: "Context Managers and Resource Safety",
              description: "Deterministic resource cleanup via RAII-like semantics.",
              criteria: [
                { statement: "Explains why context managers guarantee cleanup even on uncaught exceptions.", weight: 0.5, tier: "EASY" },
                { statement: "Implements custom context managers using either class dunder methods or contextlib.", weight: 0.5, tier: "MEDIUM" }
              ]
            }
          ],
          questions: [
            {
              type: "EXPLAIN",
              prompt: "What happens under the hood when an exception occurs inside a `with` block? Which method is called and how can it suppress or re-raise the exception?",
              tier: "MEDIUM"
            }
          ]
        }
      ]
    },
    {
      moduleTitle: "Module 7: Modules & Standard Library",
      order: 7,
      chapters: [
        {
          title: "Import Mechanics, Virtual Environments, and Python Packaging",
          order: 8,
          teachingContent: `Understanding sys.path, __name__ == '__main__', namespace packages, and virtual environments ensures production-grade deployment and maintainable modular codebases.`,
          concepts: [
            {
              slug: "python-import-system",
              name: "Import Mechanics and Entry Points",
              description: "Module caching in sys.modules and clean CLI entry points.",
              criteria: [
                { statement: "Explains the exact role of `if __name__ == '__main__':` for dual import/execution.", weight: 0.5, tier: "EASY" },
                { statement: "Explains module resolution order and circular import resolution.", weight: 0.5, tier: "HARD" }
              ]
            }
          ],
          questions: [
            {
              type: "DEBUG",
              prompt: "What causes a circular import error in Python, and what are two architectural techniques to resolve it?",
              tier: "MEDIUM"
            }
          ]
        }
      ]
    },
    {
      moduleTitle: "Module 8: Capstone Project & AI Viva Defense",
      order: 8,
      chapters: [
        {
          title: "Final Capstone: LRU Cache Implementation & Conversational Viva",
          order: 9,
          teachingContent: `In this final chapter, you will implement a memory-bounded Least Recently Used (LRU) Cache combining hash table lookups with doubly-linked list node tracking. You will then defend your algorithmic choices in a multi-turn oral defense with the AI examiner.`,
          concepts: [
            {
              slug: "lru-cache-tradeoffs",
              name: "LRU Cache Data Structure Synthesis",
              description: "Combining O(1) lookup with O(1) eviction.",
              criteria: [
                { statement: "Justifies why a doubly-linked list combined with a hash map provides O(1) get and put operations.", weight: 0.4, tier: "HARD" },
                { statement: "Defends memory and concurrency trade-offs under high-throughput conditions during the AI Viva.", weight: 0.6, tier: "HARD" }
              ]
            }
          ],
          questions: [
            {
              type: "VIVA",
              prompt: "Why did you choose a doubly-linked list instead of a singly-linked list for the LRU eviction queue? What happens to removal time complexity if you use a singly-linked list?",
              tier: "HARD"
            },
            {
              type: "VIVA",
              prompt: "How would your LRU cache implementation behave if multiple concurrent threads accessed it simultaneously? What synchronization mechanism would you introduce and what bottleneck would it create?",
              tier: "HARD"
            }
          ]
        }
      ]
    }
  ];

  for (const modData of curriculum) {
    const mod = await prisma.module.create({
      data: {
        courseVersionId: courseVersion.id,
        title: modData.moduleTitle,
        sequenceOrder: modData.order,
      },
    });

    for (const chapData of modData.chapters) {
      const chapter = await prisma.chapter.create({
        data: {
          moduleId: mod.id,
          title: chapData.title,
          sequenceOrder: chapData.order,
          teachingContent: chapData.teachingContent,
        },
      });

      for (const concData of chapData.concepts) {
        const concept = await prisma.concept.create({
          data: {
            chapterId: chapter.id,
            slug: concData.slug,
            name: concData.name,
            description: concData.description,
            sequenceOrder: 1,
          },
        });

        const rubric = await prisma.rubric.create({
          data: {
            conceptId: concept.id,
            title: `Evaluation Rubric for ${concData.name}`,
          },
        });

        for (const critData of concData.criteria) {
          await prisma.rubricCriterion.create({
            data: {
              rubricId: rubric.id,
              criterionStatement: critData.statement,
              weight: critData.weight,
              tierRequired: critData.tier,
            },
          });
        }
      }

      for (const qData of chapData.questions) {
        await prisma.question.create({
          data: {
            chapterId: chapter.id,
            questionType: qData.type,
            prompt: qData.prompt,
            tier: qData.tier,
          },
        });
      }
    }
  }

  console.log("Successfully seeded course 'Python Fundamentals' with 8 modules, chapters, concepts, rubrics, and questions!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
