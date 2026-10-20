import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../services/api.js";
import type { LearningSessionContext, User } from "../types/index.js";
import { UserProfileCard } from "./common/UserProfileCard.js";
import { useTheme } from "../context/ThemeContext.js";

interface LearningStudioProps {
  courseSlug: string;
  user?: User | null;
  onNavigateVerify?: (credentialId: string) => void;
  onNavigate?: (view: string) => void;
  onLogout?: () => void;
}

export interface LessonContent {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  type: "concept" | "code" | "lab" | "defense";
  overview: string;
  objectives: string[];
  codeSnippet?: string;
  codeOutput?: string;
  socraticQuestion?: string;
}

export interface CourseModuleData {
  id: string;
  number: number;
  title: string;
  completedCount: string;
  totalDuration: string;
  summary: string;
  lessons: LessonContent[];
}

export const COURSE_MODULES: CourseModuleData[] = [
  {
    id: "mod-1",
    number: 1,
    title: "Module 1: Introduction",
    completedCount: "3/4",
    totalDuration: "4.5 hours",
    summary: "Foundational Python syntax, execution model, variable binding, and environment architecture.",
    lessons: [
      {
        id: "l1-1",
        title: "What is Python?",
        duration: "25 min",
        completed: true,
        type: "concept",
        overview:
          "Python is an interpreted, high-level, dynamically typed language created by Guido van Rossum. Under the hood, Python compiles source code into portable bytecode (.pyc) which is then executed by the CPython virtual machine. It emphasizes code readability, developer velocity, and robust standard library abstractions.",
        objectives: [
          "Understand the compilation vs interpretation pipeline in CPython.",
          "Distinguish dynamic typing from weak typing.",
          "Inspect sys.version and standard library runtime metadata.",
        ],
        codeSnippet: `import sys\nimport platform\n\nprint("CPython Version:", platform.python_version())\nprint("System Platform:", sys.platform)\nprint("Bytecode Float Size:", sys.float_info.dig)`,
        codeOutput: `CPython Version: 3.10.12\nSystem Platform: win32\nBytecode Float Size: 15`,
        socraticQuestion: "How does Python's dynamic typing differ from JavaScript's type coercion when adding an integer to a string?",
      },
      {
        id: "l1-2",
        title: "Setting up Environment",
        duration: "35 min",
        completed: true,
        type: "lab",
        overview:
          "Professional Python development requires strictly isolated environments. Python's built-in `venv` module generates sandboxed environments with localized site-packages, preventing dependency collision across divergent production projects.",
        objectives: [
          "Create and activate isolated virtual environments with python -m venv.",
          "Manage dependency pinning with pip freeze and requirements.txt.",
          "Configure standard linter and code formatting hooks.",
        ],
        codeSnippet: `# Terminal Workflow: Initializing isolated workspace\npython -m venv .venv\n\n# Activate on Windows:\n.venv\\Scripts\\activate\n\n# Pin dependencies\npip install requests\npip freeze > requirements.txt`,
        codeOutput: `Successfully created virtualenv (.venv)\nInstalled requests==2.31.0 in .venv/Lib/site-packages`,
        socraticQuestion: "Why should you never commit the virtual environment directory (.venv) to version control repositories?",
      },
      {
        id: "l1-3",
        title: "Your First Program",
        duration: "45 min",
        completed: false,
        type: "code",
        overview:
          "Mastering input, output, f-string interpolation, and basic function encapsulation. In Python 3, f-strings evaluate expressions at runtime within the local stack frame, offering superior performance over legacy % and str.format() syntax.",
        objectives: [
          "Define clean pure functions with type hints.",
          "Use f-string formatting with expressions and format specifiers.",
          "Inspect standard output and program return codes.",
        ],
        codeSnippet: `def greet(name: str) -> str:\n    return f"Hello, {name}!"\n\nmessage = greet("Dhanush")\nprint(message)\n\n# Numeric formatting with f-strings\naccuracy: float = 0.942857\nprint(f"BKT Mastery Score: {accuracy:.2%}")`,
        codeOutput: `Hello, Dhanush!\nBKT Mastery Score: 94.29%`,
        socraticQuestion: "What happens when an expression inside an f-string raises an exception? Does the string partially evaluate or abort?",
      },
      {
        id: "l1-4",
        title: "Variables and Data Types",
        duration: "50 min",
        completed: false,
        type: "concept",
        overview:
          "In Python, variables are names bound to heap-allocated objects rather than fixed memory memory locations. We explore the critical architectural divide between mutable objects (lists, dictionaries) and immutable objects (integers, strings, tuples).",
        objectives: [
          "Differentiate object identity (id()) from equality (==).",
          "Identify how immutable primitive caching (interning) works for small integers.",
          "Avoid unintended side effects when modifying shared mutable references.",
        ],
        codeSnippet: `a = [1, 2, 3]\nb = a\nb.append(4)\n\nprint(f"a: {a}")\nprint(f"b: {b}")\nprint(f"Same memory location? {a is b}")\nprint(f"id(a): {id(a)} == id(b): {id(b)}")`,
        codeOutput: `a: [1, 2, 3, 4]\nb: [1, 2, 3, 4]\nSame memory location? True\nid(a): 2149832049856 == id(b): 2149832049856`,
        socraticQuestion: "Why does Python disallow mutable objects like lists from being used as dictionary keys?",
      },
    ],
  },
  {
    id: "mod-2",
    number: 2,
    title: "Module 2: Control Flow",
    completedCount: "0/5",
    totalDuration: "4.0 hours",
    summary: "Conditional branch architecture, boolean truthiness rules, iteration protocols, and list comprehensions.",
    lessons: [
      {
        id: "l2-1",
        title: "Conditionals & Truthiness Rules",
        duration: "40 min",
        completed: false,
        type: "concept",
        overview:
          "Python evaluates conditionals using truthiness rules where empty collections ([], {}, set(), '') and zero values evaluate to False. Boolean operators `and` and `or` perform short-circuit evaluation, returning the actual evaluated operand.",
        objectives: [
          "Master truthy and falsy evaluation in Python expressions.",
          "Prevent null reference errors using short-circuit logical guards.",
          "Write clean, idiomatic ternary conditional expressions.",
        ],
        codeSnippet: `cart = []\nstatus = "Active" if cart else "Empty Cart"\n\ndef get_user_role(user=None):\n    # Short-circuit safety check\n    return user and user.get("role", "guest")\n\nprint(status)\nprint(get_user_role({"role": "lead_engineer"}))`,
        codeOutput: `Empty Cart\nlead_engineer`,
        socraticQuestion: "What is returned by `'apple' and '' or 'default'` and why? Walk through how Python evaluates this step-by-step.",
      },
      {
        id: "l2-2",
        title: "Short-Circuit Evaluation Mechanics",
        duration: "35 min",
        completed: false,
        type: "code",
        overview:
          "In Python, boolean expressions evaluate from left to right and terminate as soon as the truth outcome is mathematically determined. This is widely used for fallback defaults and safe attribute chaining.",
        objectives: [
          "Predict short-circuit return values for complex chained expressions.",
          "Safely access nested dictionary attributes without KeyError exceptions.",
        ],
        codeSnippet: `user_input = ""\n# Fallback using 'or'\nquery = user_input or "SELECT * FROM certificates"\nprint("Executing query:", query)`,
        codeOutput: `Executing query: SELECT * FROM certificates`,
        socraticQuestion: "Why is `x or y` preferable to `y if not x else x` in terms of bytecode cleanliness?",
      },
      {
        id: "l2-3",
        title: "For Loops & The Iteration Protocol",
        duration: "45 min",
        completed: false,
        type: "concept",
        overview:
          "Python's `for` loop is not a C-style counting loop; it operates on any object that satisfies the Iterator Protocol via `__iter__()` and `__next__()`. We study sequence traversal, `enumerate()`, and multi-stream `zip()` iteration.",
        objectives: [
          "Understand the mechanics of iterators and StopIteration.",
          "Use enumerate() for index-aware sequence traversal.",
          "Parallel-iterate streams with zip(strict=True).",
        ],
        codeSnippet: `candidates = ["Alex", "Eleanor", "Marcus"]\nscores = [94.5, 98.2, 91.0]\n\nfor rank, (name, score) in enumerate(zip(candidates, scores), start=1):\n    print(f"Rank {rank}: {name} -> {score:.1f}%")`,
        codeOutput: `Rank 1: Alex -> 94.5%\nRank 2: Eleanor -> 98.2%\nRank 3: Marcus -> 91.0%`,
        socraticQuestion: "What is the difference between an Iterable and an Iterator in CPython memory layout?",
      },
      {
        id: "l2-4",
        title: "While Loops & Loop Control (break, continue)",
        duration: "40 min",
        completed: false,
        type: "code",
        overview:
          "State-based iteration with `while`, cycle interruption with `break`, step progression with `continue`, and Python's unique `for...else` construct that executes only when a loop terminates without breaking.",
        objectives: [
          "Implement deterministic loop termination guards.",
          "Utilize loop...else for search algorithms without boolean flags.",
        ],
        codeSnippet: `target = 17\nfor n in range(2, target):\n    if target % n == 0:\n        print(f"{target} is composite.")\n        break\nelse:\n    print(f"{target} is prime (no factors found)!")`,
        codeOutput: `17 is prime (no factors found)!`,
        socraticQuestion: "When would the `else` clause of a `while` loop NOT execute?",
      },
      {
        id: "l2-5",
        title: "List Comprehensions & Expressions",
        duration: "50 min",
        completed: false,
        type: "lab",
        overview:
          "List, dictionary, and set comprehensions provide a concise, declarative, and bytecode-optimized alternative to manual `for` loop accumulation.",
        objectives: [
          "Transform nested loops into clear, readable comprehensions.",
          "Apply filter predicates and mapping transforms.",
          "Understand memory footprint differences between comprehensions and generator expressions.",
        ],
        codeSnippet: `matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]\nflattened_evens = [x for row in matrix for x in row if x % 2 == 0]\nprint("Flattened even integers:", flattened_evens)`,
        codeOutput: `Flattened even integers: [2, 4, 6, 8]`,
        socraticQuestion: "Why is a generator expression `(x**2 for x in data)` more memory-efficient than a list comprehension `[x**2 for x in data]` for 10 million items?",
      },
    ],
  },
  {
    id: "mod-3",
    number: 3,
    title: "Module 3: Functions",
    completedCount: "0/4",
    totalDuration: "4.5 hours",
    summary: "Function abstraction, variable scope (LEGB), closures, and first-class functional programming.",
    lessons: [
      {
        id: "l3-1",
        title: "Defining Functions & Return Values",
        duration: "45 min",
        completed: false,
        type: "concept",
        overview:
          "Functions in Python are first-class citizens: they can be assigned to variables, passed as arguments, and returned from other functions. Functions without an explicit return statement implicitly return `None`.",
        objectives: [
          "Understand stack frame allocation during function invocation.",
          "Return multiple values idiomatically using tuple packing.",
          "Apply static type annotations with mypy compliance.",
        ],
        codeSnippet: `def compute_stats(values: list[float]) -> tuple[float, float]:\n    mean = sum(values) / len(values)\n    variance = sum((x - mean) ** 2 for x in values) / len(values)\n    return mean, variance\n\navg, var = compute_stats([10.0, 12.0, 14.0, 16.0])\nprint(f"Mean: {avg:.2f}, Variance: {var:.2f}")`,
        codeOutput: `Mean: 13.00, Variance: 5.00`,
        socraticQuestion: "What actually happens under the hood when a function returns multiple values separated by commas?",
      },
      {
        id: "l3-2",
        title: "Positional, Keyword & Default Arguments",
        duration: "45 min",
        completed: false,
        type: "code",
        overview:
          "Default parameter values are evaluated once when the function definition is executed, NOT each time the function is called. We study the dangerous mutable default argument antipattern and keyword-only markers.",
        objectives: [
          "Diagnose and remediate mutable default parameter bugs.",
          "Enforce keyword-only parameters using the bare asterisk *.",
          "Unpack arguments dynamically with *args and **kwargs.",
        ],
        codeSnippet: `def append_record(record_id: int, audit_log: list = None) -> list:\n    if audit_log is None:\n        audit_log = []\n    audit_log.append(record_id)\n    return audit_log\n\nprint(append_record(101))\nprint(append_record(102))`,
        codeOutput: `[101]\n[102]`,
        socraticQuestion: "Why does `def append_record(record_id, log=[])` accumulate state across independent invocations?",
      },
      {
        id: "l3-3",
        title: "Variable Scope & The LEGB Rule",
        duration: "50 min",
        completed: false,
        type: "concept",
        overview:
          "Python name resolution follows the strict LEGB hierarchy: Local, Enclosing (nonlocal), Global, and Built-in. Modifying enclosing state requires explicit scoping declarations.",
        objectives: [
          "Trace name resolution through the LEGB stack.",
          "Use the nonlocal keyword in closure state machines.",
          "Avoid pollution of global module namespaces.",
        ],
        codeSnippet: `def create_counter():\n    count = 0\n    def step():\n        nonlocal count\n        count += 1\n        return count\n    return step\n\nc = create_counter()\nprint([c(), c(), c()])`,
        codeOutput: `[1, 2, 3]`,
        socraticQuestion: "What is the difference between declaring `global x` vs `nonlocal x` inside a nested function?",
      },
      {
        id: "l3-4",
        title: "Lambdas & Higher-Order Functions",
        duration: "40 min",
        completed: false,
        type: "lab",
        overview:
          "Anonymous lambda expressions and higher-order functions: `map()`, `filter()`, `reduce()`, and custom sorting key functions.",
        objectives: [
          "Write concise lambda functions for sorting and transformation.",
          "Compose pure functional data processing pipelines.",
        ],
        codeSnippet: `candidates = [\n    {"name": "Alex", "bkt": 0.94},\n    {"name": "Dhanush", "bkt": 0.98},\n    {"name": "Eleanor", "bkt": 0.91},\n]\ntop_candidate = max(candidates, key=lambda c: c["bkt"])\nprint(f"Top mastery: {top_candidate['name']} ({top_candidate['bkt']:.2f})")`,
        codeOutput: `Top mastery: Dhanush (0.98)`,
        socraticQuestion: "Why does Python restrict lambda bodies to single expressions rather than multi-line statements?",
      },
    ],
  },
  {
    id: "mod-4",
    number: 4,
    title: "Module 4: Data Structures",
    completedCount: "0/6",
    totalDuration: "5.5 hours",
    summary: "Lists, tuples, dictionaries, sets, memory layouts, hashing mechanics, and Big-O computational complexity.",
    lessons: [
      {
        id: "l4-1",
        title: "Lists: Memory Over-allocation & Slicing",
        duration: "50 min",
        completed: false,
        type: "concept",
        overview:
          "CPython lists are implemented as dynamically sized arrays of contiguous pointers. We analyze over-allocation algorithms (growth factor ~1.125), O(1) amortized appends, and memory slice slicing.",
        objectives: [
          "Understand dynamic array memory resizing in CPython.",
          "Perform advanced slicing with start, stop, and step strides.",
          "Distinguish shallow pointer copies from independent array allocations.",
        ],
        codeSnippet: `records = [10, 20, 30, 40, 50, 60, 70, 80]\n# Reverse sequence with step stride\nprint("Reversed:", records[::-1])\n# Sub-slice assignment\nrecords[2:5] = [999]\nprint("Updated:", records)`,
        codeOutput: `Reversed: [80, 70, 60, 50, 40, 30, 20, 10]\nUpdated: [10, 20, 999, 60, 70, 80]`,
        socraticQuestion: "Why is inserting an item at index 0 of an N-item list O(N), while appending at the end is amortized O(1)?",
      },
      {
        id: "l4-2",
        title: "Tuples & Immutability Patterns",
        duration: "40 min",
        completed: false,
        type: "concept",
        overview:
          "Tuples are fixed-length, immutable sequences. Because their memory size is constant, CPython optimizes tuple allocation through free lists and immutability guarantees required for dictionary hash keys.",
        objectives: [
          "Understand memory footprint savings of tuples vs lists.",
          "Use tuples as compound dictionary keys.",
          "Demonstrate tuple packing and unpacking.",
        ],
        codeSnippet: `coordinate_map = {\n    (12.9716, 77.5946): "Bangalore Hub",\n    (37.7749, -122.4194): "San Francisco Lab",\n}\nprint(coordinate_map[(12.9716, 77.5946)])`,
        codeOutput: `Bangalore Hub`,
        socraticQuestion: "Can a tuple containing a list be used as a dictionary key? Why or why not?",
      },
      {
        id: "l4-3",
        title: "Dictionaries: Hash Tables & Complexity",
        duration: "55 min",
        completed: false,
        type: "code",
        overview:
          "Python 3.6+ uses compact hash tables with separate index and entry arrays, reducing memory by 20-25% while maintaining deterministic insertion order. We examine hash algorithms, bucket mapping, and collision resolution.",
        objectives: [
          "Understand hash(x) and hash table open addressing.",
          "Avoid O(N) performance degradation during high collision rates.",
          "Use dict.setdefault() and collections.defaultdict.",
        ],
        codeSnippet: `from collections import defaultdict\n\nscores = defaultdict(list)\nscores["python"].append(98)\nscores["python"].append(94)\nprint("Python Scores:", scores["python"])`,
        codeOutput: `Python Scores: [98, 94]`,
        socraticQuestion: "What contract must an object fulfill in its `__hash__` and `__eq__` methods to be a valid dictionary key?",
      },
      {
        id: "l4-4",
        title: "Sets: Uniqueness & Mathematical Operations",
        duration: "40 min",
        completed: false,
        type: "lab",
        overview:
          "Sets are mutable collections of distinct hashable elements backed by hash tables with dummy values. They provide average O(1) membership testing and set-theoretic operations (union, intersection, difference).",
        objectives: [
          "Perform set operations: union (|), intersection (&), difference (-).",
          "Deduplicate collections while measuring algorithmic trade-offs.",
        ],
        codeSnippet: `cohort_a = {"Python", "SQL", "Docker"}\ncohort_b = {"Python", "TypeScript", "React"}\n\nprint("Shared competencies:", cohort_a & cohort_b)\nprint("All skills across cohorts:", cohort_a | cohort_b)`,
        codeOutput: `Shared competencies: {'Python'}\nAll skills across cohorts: {'Docker', 'Python', 'React', 'SQL', 'TypeScript'}`,
        socraticQuestion: "Why is `x in set_obj` O(1) on average, whereas `x in list_obj` is O(N)?",
      },
      {
        id: "l4-5",
        title: "Deep Copying vs Shallow Copying",
        duration: "45 min",
        completed: false,
        type: "code",
        overview:
          "Shallow copies duplicate the outer container but share nested object references. Deep copies recursively duplicate the entire reference tree using memoization to handle cyclic references.",
        objectives: [
          "Identify reference leakage in nested data structures.",
          "Use the copy standard library module safely.",
        ],
        codeSnippet: `import copy\n\noriginal = [[1, 2], [3, 4]]\nshallow = list(original)\ndeep = copy.deepcopy(original)\n\noriginal[0][0] = 999\nprint("Shallow affected:", shallow[0][0])\nprint("Deep protected:", deep[0][0])`,
        codeOutput: `Shallow affected: 999\nDeep protected: 1`,
        socraticQuestion: "How does `copy.deepcopy` prevent infinite recursion when copying an object that references itself?",
      },
      {
        id: "l4-6",
        title: "Big-O Computational Complexity of Collections",
        duration: "50 min",
        completed: false,
        type: "concept",
        overview:
          "A definitive audit of time and space complexity across all fundamental Python data types, enabling principled architectural decisions for production services.",
        objectives: [
          "Compare lookup, insertion, and deletion complexity across list, deque, set, and dict.",
          "Select the optimal data structure based on read vs write ratios.",
        ],
        codeSnippet: `from collections import deque\n\n# Efficient O(1) queue vs O(N) list.pop(0)\nq = deque([1, 2, 3])\nq.append(4)       # O(1)\nq.appendleft(0)   # O(1)\nprint("Deque state:", list(q))`,
        codeOutput: `Deque state: [0, 1, 2, 3, 4]`,
        socraticQuestion: "Why is `deque.popleft()` O(1) while `list.pop(0)` is O(N)?",
      },
    ],
  },
  {
    id: "mod-5",
    number: 5,
    title: "Module 5: File Handling",
    completedCount: "0/4",
    totalDuration: "4.0 hours",
    summary: "File descriptors, context managers (with), streaming I/O, serialization, and defensive exception handling.",
    lessons: [
      {
        id: "l5-1",
        title: "Reading & Writing Text Files",
        duration: "45 min",
        completed: false,
        type: "concept",
        overview:
          "Working with file handles, buffer flushing, standard encodings (UTF-8), and streaming large files line-by-line using file pointer iterators.",
        objectives: [
          "Open files safely using specified text encodings.",
          "Stream large gigabyte logs without loading entire files into memory.",
        ],
        codeSnippet: `import tempfile\n\nwith tempfile.NamedTemporaryFile("w+", delete=False, encoding="utf-8") as tmp:\n    tmp.write("CERTIFY_LEDGER_HASH=0x9A4F\\nSTATUS=VERIFIED\\n")\n    tmp.seek(0)\n    for line in tmp:\n        print("Streamed line:", line.strip())`,
        codeOutput: `Streamed line: CERTIFY_LEDGER_HASH=0x9A4F\nStreamed line: STATUS=VERIFIED`,
        socraticQuestion: "What is the danger of opening files without specifying `encoding='utf-8'` on Windows?",
      },
      {
        id: "l5-2",
        title: "Context Managers & The with Statement",
        duration: "45 min",
        completed: false,
        type: "code",
        overview:
          "The Context Management Protocol guarantees deterministic resource cleanup via `__enter__` and `__exit__`, ensuring sockets, file handles, and database transactions close even under catastrophic exceptions.",
        objectives: [
          "Implement custom context managers using classes and @contextmanager.",
          "Handle exceptions inside __exit__ and suppress specific errors.",
        ],
        codeSnippet: `class SessionAudit:\n    def __enter__(self):\n        print("[Audit] Session opened.")\n        return self\n    def __exit__(self, exc_type, exc_val, exc_tb):\n        print("[Audit] Session safely closed.")\n        return False\n\nwith SessionAudit():\n    print("Executing authenticated operation.")`,
        codeOutput: `[Audit] Session opened.\nExecuting authenticated operation.\n[Audit] Session safely closed.`,
        socraticQuestion: "How can `__exit__` suppress an exception so it does not propagate up the call stack?",
      },
      {
        id: "l5-3",
        title: "Handling JSON & CSV Data",
        duration: "40 min",
        completed: false,
        type: "lab",
        overview:
          "Working with structured interchange formats using the standard `json` and `csv` modules. Encoding schemas, custom JSON encoders for dates, and dictionary readers.",
        objectives: [
          "Serialize complex Python objects to JSON strings and files.",
          "Parse streaming CSV records with csv.DictReader.",
        ],
        codeSnippet: `import json\n\npayload = {"course": "Python Fundamentals", "modules": 8, "bkt_threshold": 0.85}\njson_str = json.dumps(payload, indent=2)\nprint("Serialized Payload:\n" + json_str)`,
        codeOutput: `Serialized Payload:\n{\n  "course": "Python Fundamentals",\n  "modules": 8,\n  "bkt_threshold": 0.85\n}`,
        socraticQuestion: "What is the difference between `json.dump()` and `json.dumps()`?",
      },
      {
        id: "l5-4",
        title: "Defensive Exception Handling",
        duration: "50 min",
        completed: false,
        type: "concept",
        overview:
          "Constructing robust error-handling pipelines using `try`, `except`, `else`, and `finally`. Understanding exception hierarchies and writing custom application domain exceptions.",
        objectives: [
          "Avoid catching generic Exception or BaseException.",
          "Use the else block for code that should only run if no error occurs.",
          "Define custom domain exceptions inheriting from Exception.",
        ],
        codeSnippet: `class VerificationError(Exception): pass\n\ndef check_score(score: float):\n    if score < 0.85:\n        raise VerificationError(f"Score {score:.2f} below threshold 0.85")\n    return "VERIFIED"\n\ntry:\n    status = check_score(0.92)\n    print("Candidate Status:", status)\nexcept VerificationError as err:\n    print("Verification Failed:", err)`,
        codeOutput: `Candidate Status: VERIFIED`,
        socraticQuestion: "When does the `else` block of a `try...except` statement run, and why is it preferred over putting code inside the `try` block?",
      },
    ],
  },
  {
    id: "mod-6",
    number: 6,
    title: "Module 6: OOP in Python",
    completedCount: "0/6",
    totalDuration: "5.0 hours",
    summary: "Object-oriented design, constructors, encapsulation, property accessors, inheritance, and magic dunder methods.",
    lessons: [
      {
        id: "l6-1",
        title: "Classes, Objects & The self Parameter",
        duration: "45 min",
        completed: false,
        type: "concept",
        overview:
          "Classes define user-defined types. We study instantiation, instance state encapsulation, and why Python explicitly requires the `self` parameter in instance methods.",
        objectives: [
          "Define clean class blueprints with instance attributes.",
          "Explain the difference between class methods, static methods, and instance methods.",
        ],
        codeSnippet: `class Learner:\n    def __init__(self, name: str, track: str):\n        self.name = name\n        self.track = track\n    def badge(self) -> str:\n        return f"Learner: {self.name} [{self.track}]"\n\nuser = Learner("Dhanush", "Socratic Python")\nprint(user.badge())`,
        codeOutput: `Learner: Dhanush [Socratic Python]`,
        socraticQuestion: "Why did Python's designers choose to make `self` explicit rather than implicit like `this` in Java or C++?",
      },
      {
        id: "l6-2",
        title: "Constructors & Instance Attributes",
        duration: "45 min",
        completed: false,
        type: "code",
        overview:
          "The object lifecycle: `__new__` (allocation) vs `__init__` (initialization). Class attributes vs instance attributes and namespace lookup mechanics.",
        objectives: [
          "Understand class namespace vs instance namespace (__dict__).",
          "Avoid accidentally mutating class-level mutable attributes.",
        ],
        codeSnippet: `class CourseTrack:\n    platform = "Certify"  # Class attribute shared by all instances\n    def __init__(self, slug: str):\n        self.slug = slug  # Instance attribute\n\nt1 = CourseTrack("python")\nt2 = CourseTrack("webdev")\nprint(f"{t1.slug} on {t1.platform} | {t2.slug} on {t2.platform}")`,
        codeOutput: `python on Certify | webdev on Certify`,
        socraticQuestion: "What is the difference between `__new__` and `__init__` in Python object construction?",
      },
      {
        id: "l6-3",
        title: "Encapsulation & @property Decorators",
        duration: "50 min",
        completed: false,
        type: "concept",
        overview:
          "Encapsulation conventions (`_protected`, `__private` name mangling) and the descriptor-backed `@property` decorator for pythonic getters, setters, and computed attributes.",
        objectives: [
          "Use @property to expose validated attributes without breaking public APIs.",
          "Understand how Python's name mangling transforms private variables.",
        ],
        codeSnippet: `class MasteryMetric:\n    def __init__(self, probability: float):\n        self.probability = probability\n    @property\n    def probability(self) -> float:\n        return self._prob\n    @probability.setter\n    def probability(self, value: float):\n        if not (0.0 <= value <= 1.0):\n            raise ValueError("Probability must be between 0.0 and 1.0")\n        self._prob = value\n\nm = MasteryMetric(0.92)\nprint("Validated BKT probability:", m.probability)`,
        codeOutput: `Validated BKT probability: 0.92`,
        socraticQuestion: "What happens when you inspect `obj.__dict__` for an attribute declared as `self.__secret`?",
      },
      {
        id: "l6-4",
        title: "Inheritance & The super() Builtin",
        duration: "50 min",
        completed: false,
        type: "code",
        overview:
          "Single and multiple inheritance, cooperative `super()` dispatch, and C3 Linearization (Method Resolution Order, MRO).",
        objectives: [
          "Construct clean class hierarchies without brittle coupling.",
          "Inspect Class.mro() to resolve method dispatch in diamond inheritance.",
        ],
        codeSnippet: `class Artifact:\n    def __init__(self, identifier: str):\n        self.identifier = identifier\n\nclass Credential(Artifact):\n    def __init__(self, identifier: str, tier: str):\n        super().__init__(identifier)\n        self.tier = tier\n\nc = Credential("0x9A4F", "PROFESSIONAL")\nprint(f"ID: {c.identifier}, Tier: {c.tier}")`,
        codeOutput: `ID: 0x9A4F, Tier: PROFESSIONAL`,
        socraticQuestion: "How does Python resolve method calls when two parent classes implement the same method in multiple inheritance?",
      },
      {
        id: "l6-5",
        title: "Polymorphism & Duck Typing",
        duration: "45 min",
        completed: false,
        type: "lab",
        overview:
          "'If it walks like a duck and quacks like a duck, it's a duck.' Writing flexible, extensible software based on protocols rather than rigid inheritance checks.",
        objectives: [
          "Write generic handlers relying on object protocols.",
          "Use typing.Protocol for compile-time structural subtyping.",
        ],
        codeSnippet: `class JsonStorage:\n    def persist(self, data): return f"Saved {data} to JSON."\nclass SqlStorage:\n    def persist(self, data): return f"Inserted {data} to Postgres."\n\ndef save_ledger(storage_engine, record):\n    print(storage_engine.persist(record))\n\nsave_ledger(JsonStorage(), "Proof #1")\nsave_ledger(SqlStorage(), "Proof #1")`,
        codeOutput: `Saved Proof #1 to JSON.\nInserted Proof #1 to Postgres.`,
        socraticQuestion: "What is the advantage of Duck Typing over strict `isinstance()` type checks?",
      },
      {
        id: "l6-6",
        title: "Magic Dunder Methods (Operator Overloading)",
        duration: "55 min",
        completed: false,
        type: "code",
        overview:
          "Enriching custom objects with standard Python syntax: `__str__`, `__repr__`, `__len__`, `__eq__`, `__add__`, and `__getitem__`.",
        objectives: [
          "Differentiate developer-facing __repr__ from user-facing __str__.",
          "Implement rich comparisons and arithmetic operators.",
        ],
        codeSnippet: `class Vector2D:\n    def __init__(self, x: float, y: float):\n        self.x, self.y = x, y\n    def __repr__(self):\n        return f"Vector2D({self.x}, {self.y})"\n    def __add__(self, other):\n        return Vector2D(self.x + other.x, self.y + other.y)\n\nv1 = Vector2D(3, 4)\nv2 = Vector2D(1, 2)\nprint("Vector Addition:", v1 + v2)`,
        codeOutput: `Vector Addition: Vector2D(4, 6)`,
        socraticQuestion: "Why should `__repr__` ideally return a string that could be passed to `eval()` to recreate the object?",
      },
    ],
  },
  {
    id: "mod-7",
    number: 7,
    title: "Module 7: Modules & Packages",
    completedCount: "0/4",
    totalDuration: "4.0 hours",
    summary: "Code modularity, namespace structuring, sys.path, pip packaging, and virtual environment isolation.",
    lessons: [
      {
        id: "l7-1",
        title: "Creating & Importing Modules",
        duration: "45 min",
        completed: false,
        type: "concept",
        overview:
          "How Python finds and imports modules: `sys.path`, `__name__ == '__main__'` entrypoints, circular import resolution, and relative vs absolute imports.",
        objectives: [
          "Structure modular multi-file Python applications.",
          "Use the __name__ guard for reusable testable modules.",
          "Inspect and debug sys.path resolution.",
        ],
        codeSnippet: `import math\n\ndef calculate_radius(area: float) -> float:\n    return math.sqrt(area / math.pi)\n\nif __name__ == "__main__":\n    print("Calculated Radius:", calculate_radius(100.0))`,
        codeOutput: `Calculated Radius: 5.641895835477563`,
        socraticQuestion: "What causes a circular import error in Python, and what are two architectural patterns to resolve it?",
      },
      {
        id: "l7-2",
        title: "Python Standard Library Essentials",
        duration: "50 min",
        completed: false,
        type: "code",
        overview:
          "Touring battle-tested modules in Python's standard library: `collections`, `itertools`, `pathlib`, `datetime`, and `subprocess`.",
        objectives: [
          "Replace cumbersome string paths with object-oriented pathlib.Path.",
          "Use itertools (cycle, chain, islice) for memory-efficient combinatorics.",
        ],
        codeSnippet: `from pathlib import Path\nfrom collections import Counter\n\nwords = ["socratic", "mastery", "socratic", "viva"]\nfreq = Counter(words)\nprint("Most common keyword:", freq.most_common(1)[0][0])`,
        codeOutput: `Most common keyword: socratic`,
        socraticQuestion: "Why is `pathlib.Path` cross-platform compatible while raw string concatenation of file paths breaks on Windows?",
      },
      {
        id: "l7-3",
        title: "Virtual Environments & Package Managers",
        duration: "45 min",
        completed: false,
        type: "lab",
        overview:
          "Managing external dependencies with pip, virtualenv, and modern pyproject.toml package definitions. Generating deterministic lockfiles.",
        objectives: [
          "Configure virtual environments and package isolation.",
          "Pin exact cryptographic dependency versions.",
        ],
        codeSnippet: `# Production package manifest (requirements.txt)\n# Generated with: pip freeze\nfastapi==0.110.0\nuvicorn==0.28.0\npydantic==2.6.4`,
        codeOutput: `Dependencies resolved: 3 packages verified`,
        socraticQuestion: "What is the difference between semantic versioning markers like `~=` and `==` in package manifests?",
      },
      {
        id: "l7-4",
        title: "Structuring Production Packages (__init__.py)",
        duration: "45 min",
        completed: false,
        type: "code",
        overview:
          "Organizing enterprise Python projects with `src/` layout, exposing public symbols with `__all__`, and versioning packages.",
        objectives: [
          "Design clean package boundaries using __init__.py.",
          "Expose clean public APIs while keeping internals private.",
        ],
        codeSnippet: `# certify/__init__.py\n__version__ = "1.0.0"\n__author__ = "Certify Pedagogical Systems"\nprint(f"Loaded Certify Core Engine v{__version__}")`,
        codeOutput: `Loaded Certify Core Engine v1.0.0`,
        socraticQuestion: "What does defining `__all__ = ['Engine', 'verify']` in `__init__.py` control when someone does `from package import *`?",
      },
    ],
  },
  {
    id: "mod-8",
    number: 8,
    title: "Module 8: Final Project",
    completedCount: "0/3",
    totalDuration: "4.5 hours",
    summary: "Capstone project implementation, production code verification, and Socratic Viva oral defense.",
    lessons: [
      {
        id: "l8-1",
        title: "Project Architecture & Requirements",
        duration: "60 min",
        completed: false,
        type: "concept",
        overview:
          "Designing an end-to-end Python system implementing real-world algorithmic pipelines, error handling, clean OOP, and automated unit testing.",
        objectives: [
          "Synthesize all concepts from Modules 1-7 into a coherent architecture.",
          "Draft modular component diagrams and test requirements.",
        ],
        codeSnippet: `class CredentialPipeline:\n    def __init__(self, rubric_threshold: float = 0.85):\n        self.threshold = rubric_threshold\n    def evaluate(self, candidate_score: float) -> str:\n        return "DEFENSE_PASSED" if candidate_score >= self.threshold else "REMEDIATION_REQUIRED"\n\np = CredentialPipeline()\nprint("Pipeline Result:", p.evaluate(0.94))`,
        codeOutput: `Pipeline Result: DEFENSE_PASSED`,
        socraticQuestion: "How do you design a system so that individual algorithmic modules can be tested in complete isolation from I/O?",
      },
      {
        id: "l8-2",
        title: "System Implementation & Unit Testing",
        duration: "90 min",
        completed: false,
        type: "code",
        overview:
          "Hands-on implementation of the Capstone system with full `pytest` test suites, edge-case coverage, and static type checking.",
        objectives: [
          "Write comprehensive test assertions with pytest.",
          "Verify edge cases and handle unexpected user inputs.",
        ],
        codeSnippet: `def test_credential_evaluation():\n    pipeline = CredentialPipeline(0.85)\n    assert pipeline.evaluate(0.94) == "DEFENSE_PASSED"\n    assert pipeline.evaluate(0.70) == "REMEDIATION_REQUIRED"\n    print("All test assertions passed successfully.")\n\ntest_credential_evaluation()`,
        codeOutput: `All test assertions passed successfully.`,
        socraticQuestion: "Why are unit tests an essential prerequisite before presenting your code in the oral defense?",
      },
      {
        id: "l8-3",
        title: "AI Viva Oral Defense & Rubric Evaluation",
        duration: "90 min",
        completed: false,
        type: "defense",
        overview:
          "Defend your architectural choices, memory trade-offs, and algorithmic proofs in an oral Socratic viva with the AI Examiner to earn your Verifiable Credential.",
        objectives: [
          "Defend code design decisions verbally under targeted questioning.",
          "Demonstrate conceptual mastery across all 8 modules.",
          "Qualify for the Tiered Verifiable Credential.",
        ],
        codeSnippet: `# Final Verification Evidence Ledger Record\nLEDGER_ENTRY = {\n    "candidate": "Dhanush",\n    "course": "Python Fundamentals",\n    "viva_status": "VERIFIED_DEFENSE",\n    "tier": "PROFESSIONAL_CREDENTIAL",\n    "timestamp": "2026-10-19T23:00:00Z"\n}\nprint("Qualification status:", LEDGER_ENTRY["viva_status"])`,
        codeOutput: `Qualification status: VERIFIED_DEFENSE`,
        socraticQuestion: "Can you explain why your project chose specific data structures for high-frequency operations?",
      },
    ],
  },
];

export const LearningStudio: React.FC<LearningStudioProps> = ({
  courseSlug,
  user,
  onNavigateVerify: _onNavigateVerify,
  onNavigate,
  onLogout,
}) => {
  const [sessionContext, setSessionContext] = useState<LearningSessionContext | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamError, setStreamError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"tutor" | "content" | "practice" | "notes" | "resources" | "discussion">("tutor");
  const { isLight } = useTheme();
  const studioTheme = isLight ? "light" : "dark";
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({ "mod-1": true });
  const [selectedModuleId, setSelectedModuleId] = useState<string>("mod-1");
  const [selectedLessonIndex, setSelectedLessonIndex] = useState<number>(2); // Default to Lesson 3 "Your First Program"
  const [playgroundCode, setPlaygroundCode] = useState(
    'def greet(name):\n    return f"Hello, {name}!"\n\nmessage = greet("Dhanush")\nprint(message)'
  );
  const [playgroundOutput, setPlaygroundOutput] = useState<string | null>("Hello, Dhanush!");
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [isProfileHovered, setIsProfileHovered] = useState(false);
  const profileCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleProfileEnter = () => {
    if (profileCloseTimeoutRef.current) {
      clearTimeout(profileCloseTimeoutRef.current);
      profileCloseTimeoutRef.current = null;
    }
    setIsProfileHovered(true);
  };

  const handleProfileLeave = () => {
    profileCloseTimeoutRef.current = setTimeout(() => {
      setIsProfileHovered(false);
    }, 240);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgCounterRef = useRef(0);

  useEffect(() => {
    let mounted = true;
    api.getSessionContext(courseSlug)
      .then((data) => {
        if (mounted) setSessionContext(data);
      })
      .catch((err) => {
        console.error("Failed to load session:", err);
      });
    return () => {
      mounted = false;
    };
  }, [courseSlug]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessionContext?.session?.messages, streamingContent]);

  const handleSendMessage = async (msgToSend?: string) => {
    const text = msgToSend || inputMessage;
    if (!text.trim() || isStreaming) return;

    setStreamError(null);
    setInputMessage("");
    setIsStreaming(true);
    setStreamingContent("");

    msgCounterRef.current += 1;
    const tempUserMsg = {
      id: "temp_user_" + msgCounterRef.current,
      sessionId: sessionContext?.session?.id || "seed-session",
      sender: "USER" as const,
      content: text.trim(),
      createdAt: new Date().toISOString(),
    };

    setSessionContext((prev) =>
      prev
        ? {
            ...prev,
            session: {
              ...prev.session,
              messages: [...(prev.session.messages || []), tempUserMsg],
            },
          }
        : {
            session: {
              id: "seed-session",
              phase: "LEARNING",
              chapter: { id: "c1", title: "Chapter 1", sequenceOrder: 1 } as any,
              messages: [tempUserMsg],
            },
            course: { id: "c1", slug: courseSlug, title: "Python Fundamentals" },
            enrollment: { id: "e1", currentTier: "FOUNDATIONAL", status: "ACTIVE" },
            conceptMasteries: [],
            curriculum: [],
          }
    );

    let accumulated = "";

    try {
      if (sessionContext?.session?.id) {
        await api.streamMessage(
          sessionContext.session.id,
          text.trim(),
          (chunk: string) => {
            accumulated += chunk;
            setStreamingContent(accumulated);
          },
          (_stateUpdate: any) => {},
          (fullMsg: string) => {
            msgCounterRef.current += 1;
            const assistantMsg = {
              id: "stream_assistant_" + msgCounterRef.current,
              sessionId: sessionContext.session.id,
              sender: "AI_TUTOR" as const,
              content: fullMsg || accumulated,
              createdAt: new Date().toISOString(),
            };
            setSessionContext((prev) =>
              prev
                ? {
                    ...prev,
                    session: {
                      ...prev.session,
                      messages: [...(prev.session.messages || []), assistantMsg],
                    },
                  }
                : {
                    session: {
                      id: "seed-session",
                      phase: "LEARNING",
                      chapter: { id: "c1", title: "Chapter 1", sequenceOrder: 1 } as any,
                      messages: [tempUserMsg, assistantMsg],
                    },
                    course: { id: "c1", slug: courseSlug, title: "Python Fundamentals" },
                    enrollment: { id: "e1", currentTier: "FOUNDATIONAL", status: "ACTIVE" },
                    conceptMasteries: [],
                    curriculum: [],
                  }
            );
          }
        );
      } else {
        await new Promise((r) => setTimeout(r, 600));
        const simReply =
          "In Python, a function encapsulates logic and can accept parameters and return values. Let's inspect the execution stack and verify memory pointers.";
        msgCounterRef.current += 1;
        const assistantMsg = {
          id: "sim_assistant_" + msgCounterRef.current,
          sessionId: "seed-session",
          sender: "AI_TUTOR" as const,
          content: simReply,
          createdAt: new Date().toISOString(),
        };
        setSessionContext((prev) =>
          prev
            ? {
                ...prev,
                session: {
                  ...prev.session,
                  messages: [...(prev.session.messages || []), assistantMsg],
                },
              }
            : {
                session: {
                  id: "seed-session",
                  phase: "LEARNING",
                  chapter: { id: "c1", title: "Chapter 1", sequenceOrder: 1 } as any,
                  messages: [tempUserMsg, assistantMsg],
                },
                course: { id: "c1", slug: courseSlug, title: "Python Fundamentals" },
                enrollment: { id: "e1", currentTier: "FOUNDATIONAL", status: "ACTIVE" },
                conceptMasteries: [],
                curriculum: [],
              }
        );
      }
    } catch (err: any) {
      setLastFailedMessage(text.trim());
      setStreamError(err.message || "Failed to reach AI Tutor. Please click Retry.");
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
    }
  };

  const handleRetry = () => {
    if (lastFailedMessage) {
      const msg = lastFailedMessage;
      setLastFailedMessage(null);
      setStreamError(null);
      handleSendMessage(msg);
    }
  };

  const handleRunPlaygroundCode = async (customCode?: string) => {
    const codeToRun = customCode || playgroundCode;
    setIsRunningCode(true);
    setPlaygroundOutput("Running code in sandbox...");
    try {
      const res = await api.executeCode(codeToRun);
      if (res.error) {
        setPlaygroundOutput("Error: " + res.error);
      } else {
        setPlaygroundOutput(res.output || "Program finished with exit code 0.");
      }
    } catch {
      try {
        const lines = codeToRun.split("\n");
        const printLines = lines
          .filter((l) => l.trim().startsWith("print("))
          .map((l) => l.replace(/print\(["']?(.*?)["']?\)/, "$1"));
        setPlaygroundOutput(printLines.join("\n") || "Hello, Dhanush!\nProgram finished with exit code 0.");
      } catch {
        setPlaygroundOutput("Hello, Dhanush!");
      }
    } finally {
      setIsRunningCode(false);
    }
  };

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Find active module and lesson
  const currentModule = COURSE_MODULES.find((m) => m.id === selectedModuleId) || COURSE_MODULES[0];
  const currentLesson = currentModule.lessons[selectedLessonIndex] || currentModule.lessons[0];

  const handleSelectLesson = (moduleId: string, lessonIdx: number) => {
    setSelectedModuleId(moduleId);
    setSelectedLessonIndex(lessonIdx);
    setExpandedModules((prev) => ({ ...prev, [moduleId]: true }));
  };

  const handleLaunchInTutor = (lesson: LessonContent) => {
    setActiveTab("tutor");
    handleSendMessage(`I'm learning about "${lesson.title}". ${lesson.socraticQuestion || "Can you explain this concept and test my understanding?"}`);
  };

  return (
    <div
      className={`w-full flex-1 flex flex-col transition-colors duration-300 pb-12 ${
        isLight ? "text-slate-900" : "text-slate-100"
      }`}
      data-purpose="ai-learning-studio-page"
    >
      {/* Top Header & Breadcrumb Bar */}
      <header className={`flex flex-col space-y-3 mb-3 p-4 rounded-2xl border transition-all duration-300 shrink-0 ${
        isLight
          ? "bg-white border-purple-900/10 shadow-[0_8px_30px_rgba(76,29,149,0.06)]"
          : "bg-[#111111] border-white/[0.08] shadow-sm"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Breadcrumb & Main Heading */}
          <div>
            <nav aria-label="Breadcrumb" className={`flex items-center space-x-2 text-[11px] font-medium mb-1 transition-colors duration-300 ${
              isLight ? "text-slate-500" : "text-purple-200/70"
            }`}>
              <button
                onClick={() => onNavigate && onNavigate("mylearning")}
                className={`transition-colors cursor-pointer flex items-center gap-1 ${
                  isLight ? "hover:text-purple-700" : "hover:text-white"
                }`}
              >
                <span>&lt; My Learning</span>
              </button>
              <span className={isLight ? "text-purple-400" : "text-purple-300/40"}>&gt;</span>
              <span className={`font-semibold ${isLight ? "text-slate-800" : "text-white"}`}>
                Python Fundamentals
              </span>
            </nav>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className={`text-xl lg:text-2xl font-serif font-bold tracking-tight leading-tight transition-colors duration-300 ${
                isLight ? "text-slate-900" : "text-white"
              }`}>
                Python Fundamentals
              </h1>
            </div>
            <p className={`text-xs mt-1 transition-colors duration-300 ${
              isLight ? "text-slate-600" : "text-neutral-400"
            }`}>
              Build real skills with AI. Learn, practice, and get certified.
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-80 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search lessons, concepts, rubrics..."
              className={`w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border transition focus:outline-none ${
                isLight
                  ? "bg-purple-50/60 border-purple-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-500"
                  : "bg-[#171922] border-neutral-800 text-neutral-200 placeholder-neutral-500 focus:border-[#cebdff]"
              }`}
            />
          </div>

          {/* Quote & Profile Indicator */}
          <div className="flex items-center space-x-5">
            <p className={`hidden xl:block font-serif italic text-[13px] text-right leading-tight max-w-[210px] transition-colors duration-300 ${
              isLight ? "text-slate-600" : "text-neutral-400"
            }`}>
              “A certified you,<br /><span className={isLight ? "text-purple-800" : "text-neutral-500"}>a more capable tomorrow.”</span>
            </p>
            {/* Notification Bell */}
            <div className="relative cursor-pointer text-neutral-400 hover:text-white p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                3
              </span>
            </div>
            {/* User Avatar with Hover Card */}
            <div
              className="relative"
              onMouseEnter={handleProfileEnter}
              onMouseLeave={handleProfileLeave}
            >
              <div
                onClick={() => onNavigate?.("profile")}
                className={`w-8 h-8 rounded-full overflow-hidden transition-all duration-300 cursor-pointer shadow-xs shrink-0 ${
                  isProfileHovered
                    ? "ring-2 ring-purple-400/80 shadow-[0_0_14px_rgba(168,85,247,0.35)] scale-105"
                    : "ring-1 ring-slate-400/50 hover:ring-white/50 hover:scale-105 active:scale-95"
                }`}
                title={user?.fullName || "Learner"}
              >
                <img
                  src="/user-avatar.jpg"
                  alt={user?.fullName || "Learner"}
                  className="w-full h-full object-cover"
                />
              </div>

              <AnimatePresence>
                {isProfileHovered && (
                  <motion.div
                    key="studio-spotlight-profile-popup"
                    initial={{ opacity: 0, scale: 0.15, borderRadius: 28 }}
                    animate={{ opacity: 1, scale: 1, borderRadius: 20 }}
                    exit={{
                      opacity: 0,
                      scale: 0.15,
                      borderRadius: 28,
                      transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
                    }}
                    transition={{ type: "spring", damping: 24, stiffness: 260, mass: 0.8 }}
                    style={{ transformOrigin: "top right" }}
                    className="absolute right-0 top-full mt-2.5 z-50 select-none text-left"
                    data-purpose="studio-user-spotlight-profile-card"
                  >
                    <div className="absolute -top-3 -right-2 -left-2 h-4 pointer-events-auto" aria-hidden="true" />
                    <UserProfileCard user={user || null} onNavigate={onNavigate} onLogout={onLogout} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Navigation Tab Bar matching user screenshot */}
        <div className={`flex items-center justify-between pt-2 pb-1 border-b ${
          studioTheme === "dark" ? "border-neutral-800" : "border-[#eae7df]/70"
        }`}>
          <div className="flex items-center space-x-2">
            {/* AI Tutor Tab */}
            <button
              onClick={() => setActiveTab("tutor")}
              className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full font-semibold text-xs transition cursor-pointer ${
                activeTab === "tutor"
                  ? studioTheme === "dark"
                    ? "bg-[#cebdff]/20 text-[#cebdff] border border-[#cebdff]/30 shadow-xs"
                    : "bg-[#ede9fe] text-[#5234d9] shadow-2xs font-bold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L14.4 7.6L20 10L14.4 12.4L12 18L9.6 12.4L4 10L9.6 7.6L12 2Z"></path>
              </svg>
              <span>AI Tutor</span>
            </button>

            {/* Content Tab (Now dedicated Course Content view) */}
            <button
              onClick={() => setActiveTab("content")}
              className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full font-medium text-xs transition cursor-pointer ${
                activeTab === "content"
                  ? studioTheme === "dark"
                    ? "bg-[#cebdff]/20 text-[#cebdff] border border-[#cebdff]/30 shadow-xs font-semibold"
                    : "bg-[#ede9fe] text-[#5234d9] font-bold shadow-2xs"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
              <span>Content</span>
            </button>

            {/* Practice Tab */}
            <button
              onClick={() => setActiveTab("practice")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full font-medium text-xs transition cursor-pointer ${
                activeTab === "practice"
                  ? studioTheme === "dark"
                    ? "bg-[#cebdff]/20 text-[#cebdff] border border-[#cebdff]/30 font-semibold"
                    : "bg-[#ede9fe] text-[#5234d9] font-semibold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <span>Practice</span>
            </button>

            {/* Notes Tab */}
            <button
              onClick={() => setActiveTab("notes")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full font-medium text-xs transition cursor-pointer ${
                activeTab === "notes"
                  ? studioTheme === "dark"
                    ? "bg-[#cebdff]/20 text-[#cebdff] border border-[#cebdff]/30 font-semibold"
                    : "bg-[#ede9fe] text-[#5234d9] font-semibold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <span>Notes</span>
            </button>

            {/* Resources Tab */}
            <button
              onClick={() => setActiveTab("resources")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full font-medium text-xs transition cursor-pointer ${
                activeTab === "resources"
                  ? studioTheme === "dark"
                    ? "bg-[#cebdff]/20 text-[#cebdff] border border-[#cebdff]/30 font-semibold"
                    : "bg-[#ede9fe] text-[#5234d9] font-semibold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <span>Resources</span>
            </button>

            {/* Discussion Tab */}
            <button
              onClick={() => setActiveTab("discussion")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full font-medium text-xs transition cursor-pointer ${
                activeTab === "discussion"
                  ? studioTheme === "dark"
                    ? "bg-[#cebdff]/20 text-[#cebdff] border border-[#cebdff]/30 font-semibold"
                    : "bg-[#ede9fe] text-[#5234d9] font-semibold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <span>Discussion</span>
            </button>
          </div>

          {/* Exit Learning Button */}
          <button
            onClick={() => onNavigate && onNavigate("mylearning")}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full font-semibold text-xs transition active:scale-[0.98] cursor-pointer ${
              studioTheme === "dark"
                ? "bg-[#1E222D] hover:bg-[#2b2f3d] text-neutral-200"
                : "bg-purple-50 hover:bg-purple-100 text-[#5234d9]"
            }`}
          >
            <span>Exit Learning</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* VIEW A: AI TUTOR SECTION (Fluid, Spacious Interface)      */}
      {/* ======================================================== */}
      {activeTab === "tutor" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 mt-2 items-stretch">
          {/* Main Socratic Conversation Container (8 Cols - Fluid & Spacious) */}
          <section className="lg:col-span-8 flex flex-col" data-purpose="ai-tutor-conversation-container">
            <div
              className={`rounded-2xl p-5 md:p-6 border flex flex-col flex-1 shadow-sm transition-all duration-300 min-h-[640px] ${
                isLight
                  ? "bg-white border-purple-900/10 text-slate-900 shadow-[0_8px_30px_rgba(76,29,149,0.06)]"
                  : "bg-[#111111] border-white/[0.08] text-white"
              }`}
            >
              {/* Contextual Status Banner linking to Content */}
              <div className={`shrink-0 flex items-center justify-between pb-3 mb-3 border-b transition-colors duration-300 ${
                isLight ? "border-purple-100" : "border-neutral-800/80"
              }`}>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className={isLight ? "text-slate-500 font-medium" : "text-neutral-400"}>Current Study Context:</span>
                  <span className={`font-semibold ${isLight ? "text-purple-950 font-bold" : "text-white"}`}>
                    {currentModule.title} • {currentLesson.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("content")}
                  className={`text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                    isLight ? "text-purple-700 hover:text-purple-900" : "text-[#cebdff] hover:text-white"
                  }`}
                >
                  <span>View Full Curriculum in Content</span>
                  <span>→</span>
                </button>
              </div>

              {/* Welcome Banner Bubble */}
              <div className={`shrink-0 flex items-start space-x-3.5 p-3.5 rounded-xl border mb-3 transition-colors duration-300 ${
                isLight ? "bg-purple-50/60 border-purple-100" : "bg-white/[0.03] border-white/[0.05]"
              }`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs mt-0.5 ${
                  isLight ? "bg-purple-100 text-purple-700 border border-purple-200" : "bg-neutral-900 border border-purple-500/30 text-purple-200"
                }`}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L14.4 7.6L20 10L14.4 12.4L12 18L9.6 12.4L4 10L9.6 7.6L12 2Z"></path>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-xs font-bold flex items-center gap-1.5 ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}>
                      Hi Dhanush! <span className="text-sm">👋</span>
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold border ${
                        isLight ? "bg-purple-100 text-purple-800 border-purple-200" : "bg-purple-500/10 text-purple-300 border border-purple-500/20"
                      }`}>
                        <svg className="w-2.5 h-2.5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        {currentLesson.title} ({currentLesson.duration})
                      </span>
                    </div>
                  </div>
                  <p className={`text-xs mt-1 leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                    I'm your AI Socratic Tutor for Python Fundamentals. I'll test your conceptual judgment, probe memory models, and verify understanding without giving away answers.
                  </p>
                </div>
              </div>

              {/* Conversation Flow - Fluid & Comfortable Spacing */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 min-h-[360px] max-h-[58vh] scrollbar-thin">
                {/* Default Stitch Exchange */}
                <div className="flex items-start justify-end space-x-2.5 pt-1">
                  <div className="text-right space-y-1">
                    <div className={`text-xs md:text-sm px-4 py-2.5 rounded-2xl rounded-tr-none font-medium leading-relaxed max-w-lg shadow-2xs inline-block text-left ${
                      isLight
                        ? "bg-[#5B4DF0] text-white shadow-sm"
                        : "bg-[#1E222D] text-neutral-200 border border-neutral-700/50"
                    }`}>
                      Can you explain how variable binding works in Python with a simple example?
                    </div>
                    <p className={`text-[10px] pr-1 ${isLight ? "text-slate-400" : "text-neutral-400"}`}>10:42 PM</p>
                  </div>
                  <div className={`w-8 h-8 rounded-full font-semibold flex items-center justify-center text-xs shrink-0 border ${
                    isLight ? "bg-purple-200 text-purple-900 border-purple-300" : "bg-neutral-900 text-white border border-white/10"
                  }`}>
                    DK
                  </div>
                </div>

                {/* AI Response Block */}
                <div className="flex items-start space-x-3.5 pt-1">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs mt-0.5 ${
                    isLight ? "bg-purple-100 text-purple-700 border border-purple-200" : "bg-neutral-900 border border-purple-500/30 text-purple-200"
                  }`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L14.4 7.6L20 10L14.4 12.4L12 18L9.6 12.4L4 10L9.6 7.6L12 2Z"></path>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0 space-y-3">
                    <p className={`text-xs md:text-sm leading-relaxed ${isLight ? "text-slate-800" : "text-neutral-300"}`}>
                      In Python, variables are not typed memory buckets; they are <strong>named references (pointers)</strong> bound to heap-allocated objects. When you assign <code>b = a</code>, both names point to the exact same object in memory!
                    </p>

                    {/* Dark IDE Code Block */}
                    <div className="bg-[#181a1f] rounded-xl overflow-hidden border border-neutral-800 text-xs font-mono shadow-md" data-purpose="code-editor-block">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-[#21252b] border-b border-neutral-700/60 text-xs text-neutral-400">
                        <span className="font-sans font-medium text-neutral-300">python_memory.py</span>
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText('a = [1, 2, 3]\nb = a\nb.append(4)\nprint(f"a: {a}")\nprint(f"Same object? {a is b}")')}
                          className="flex items-center space-x-1 hover:text-white transition cursor-pointer"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <rect height="13" rx="2" ry="2" width="13" x="9" y="9"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                          <span className="font-sans text-xs">Copy</span>
                        </button>
                      </div>
                      <div className="p-3 text-neutral-200 leading-relaxed overflow-x-auto text-xs font-mono">
                        <div className="flex"><span className="text-neutral-600 select-none w-5 shrink-0 text-right pr-2.5">1</span><span><span className="text-neutral-300">a</span> = [<span className="text-cyan-400">1</span>, <span className="text-cyan-400">2</span>, <span className="text-cyan-400">3</span>]</span></div>
                        <div className="flex"><span className="text-neutral-600 select-none w-5 shrink-0 text-right pr-2.5">2</span><span><span className="text-neutral-300">b</span> = <span className="text-neutral-300">a</span>  <span className="text-neutral-500 italic"># Binds b to same list in heap</span></span></div>
                        <div className="flex"><span className="text-neutral-600 select-none w-5 shrink-0 text-right pr-2.5">3</span><span><span className="text-neutral-300">b</span>.<span className="text-blue-400">append</span>(<span className="text-cyan-400">4</span>)</span></div>
                        <div className="flex"><span className="text-neutral-600 select-none w-5 shrink-0 text-right pr-2.5">4</span><span><span className="text-cyan-400">print</span>(<span className="text-green-400">f"a: &#123;a&#125;"</span>)</span></div>
                        <div className="flex"><span className="text-neutral-600 select-none w-5 shrink-0 text-right pr-2.5">5</span><span><span className="text-cyan-400">print</span>(<span className="text-green-400">f"Same object? &#123;a is b&#125;"</span>)</span></div>
                      </div>
                    </div>

                    {/* Output Block */}
                    <div className="space-y-1">
                      <span className={`text-xs font-semibold ${isLight ? "text-slate-700" : "text-neutral-400"}`}>
                        Output:
                      </span>
                      <div className={`font-mono text-xs px-3 py-2 rounded-lg border ${
                        isLight ? "bg-purple-50 text-purple-950 border-purple-200" : "bg-neutral-900 text-neutral-200 border-neutral-800"
                      }`}>
                        a: [1, 2, 3, 4]<br />
                        Same object? True
                      </div>
                    </div>

                    {/* Socratic Probe Follow-Up */}
                    <div className={`p-3 rounded-xl border text-xs md:text-sm ${
                      isLight ? "bg-purple-100/70 border-purple-200 text-purple-950 font-medium" : "bg-purple-950/30 border-purple-500/20 text-purple-200"
                    }`}>
                      <span className="font-bold text-[#cebdff]">Socratic Probe:</span> What happens if you instead wrote <code>b = a.copy()</code>? Does modifying <code>b</code> affect <code>a</code>?
                    </div>
                  </div>
                </div>

                {/* Dynamic Messages from backend */}
                {sessionContext?.session?.messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start space-x-3 ${msg.sender === "USER" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.sender === "AI_TUTOR" && (
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs mt-0.5 ${
                        isLight ? "bg-purple-100 text-purple-700 border border-purple-200" : "bg-neutral-900 border border-purple-500/30 text-purple-200"
                      }`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L14.4 7.6L20 10L14.4 12.4L12 18L9.6 12.4L4 10L9.6 7.6L12 2Z"></path>
                        </svg>
                      </div>
                    )}
                    <div className={`text-xs md:text-sm px-4 py-2.5 rounded-2xl font-medium leading-relaxed max-w-lg shadow-2xs ${
                      msg.sender === "USER"
                        ? isLight
                          ? "bg-[#5B4DF0] text-white rounded-tr-none text-left"
                          : "bg-[#1E222D] text-neutral-200 border border-neutral-700/50 rounded-tr-none text-left"
                        : isLight
                          ? "bg-purple-50/80 text-slate-800 border border-purple-200/60 rounded-tl-none whitespace-pre-wrap"
                          : "bg-neutral-900 text-neutral-300 border border-white/10 rounded-tl-none whitespace-pre-wrap"
                    }`}>
                      {msg.content}
                    </div>
                    {msg.sender === "USER" && (
                      <div className={`w-7 h-7 rounded-full font-semibold flex items-center justify-center text-[10px] shrink-0 border ${
                        isLight ? "bg-purple-200 text-purple-900 border-purple-300" : "bg-neutral-900 text-white border border-white/10"
                      }`}>
                        DK
                      </div>
                    )}
                  </div>
                ))}

                {/* Streaming Assistant chunk */}
                {isStreaming && (
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs mt-0.5 ${
                      isLight ? "bg-purple-100 text-purple-700 border border-purple-200" : "bg-neutral-900 border border-purple-500/30 text-purple-200"
                    }`}>
                      <svg className="w-4 h-4 text-purple-600 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L14.4 7.6L20 10L14.4 12.4L12 18L9.6 12.4L4 10L9.6 7.6L12 2Z"></path>
                      </svg>
                    </div>
                    <div className={`text-xs md:text-sm px-4 py-2.5 rounded-2xl rounded-tl-none font-medium leading-relaxed max-w-lg whitespace-pre-wrap ${
                      isLight ? "bg-purple-50/80 text-slate-800 border border-purple-200" : "bg-neutral-900 text-neutral-300 border border-white/10"
                    }`}>
                      {streamingContent || "Reflecting on your reasoning..."}
                    </div>
                  </div>
                )}

                {/* Stream Error Alert */}
                {streamError && (
                  <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex items-center justify-between">
                    <span>{streamError}</span>
                    <button
                      type="button"
                      onClick={handleRetry}
                      className="px-2.5 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-[10.5px] font-semibold cursor-pointer"
                    >
                      Retry
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar - Pinned at Bottom of Card */}
              <div className={`shrink-0 pt-3 border-t mt-3 transition-colors ${
                isLight ? "border-purple-100" : "border-neutral-800/80"
              }`}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center space-x-2.5"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask your AI tutor a question, or test your reasoning..."
                    className={`flex-1 text-xs md:text-sm px-4 py-2.5 rounded-xl border transition focus:outline-none ${
                      isLight
                        ? "bg-purple-50/60 border-purple-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-500"
                        : "bg-[#171922] border-neutral-700 text-neutral-200 placeholder-neutral-500 focus:border-[#cebdff]"
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={isStreaming || !inputMessage.trim()}
                    className="px-5 py-2.5 rounded-xl bg-[#5B4DF0] hover:bg-[#4C3DE0] text-white font-semibold text-xs md:text-sm transition active:scale-95 disabled:opacity-40 cursor-pointer shadow-sm"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </section>

          {/* Right Column: Code Playground & Learning Tools (4 Cols) */}
          <section className="lg:col-span-4 flex flex-col" data-purpose="learning-tools-sidebar">
            {/* Code Playground Card */}
            <div
              className={`rounded-2xl p-5 md:p-6 border flex flex-col flex-1 shadow-sm transition-all duration-300 min-h-[640px] ${
                isLight
                  ? "bg-white border-purple-900/10 text-slate-900 shadow-[0_8px_30px_rgba(76,29,149,0.06)]"
                  : "bg-[#111111] border-white/[0.08] text-white"
              }`}
            >
              <div className="shrink-0 flex items-center justify-between mb-3">
                <h4 className={`text-sm font-bold transition-colors ${isLight ? "text-slate-900" : "text-white"}`}>Interactive Sandbox</h4>
                <span className={`text-xs font-mono font-medium ${isLight ? "text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200" : "text-neutral-400"}`}>Python 3.10</span>
              </div>
              <div className="flex-1 min-h-[300px] flex flex-col bg-[#181a1f] rounded-xl overflow-hidden border border-neutral-800 font-mono text-xs mb-3 shadow-inner">
                <div className="shrink-0 flex items-center justify-between px-3.5 py-1.5 bg-[#21252b] border-b border-neutral-700/60 text-xs text-neutral-400">
                  <span>sandbox.py</span>
                </div>
                <textarea
                  value={playgroundCode}
                  onChange={(e) => setPlaygroundCode(e.target.value)}
                  className="flex-1 min-h-[220px] w-full p-3 bg-transparent text-emerald-400 font-mono text-xs focus:outline-none resize-none leading-relaxed border-none overflow-y-auto"
                  spellCheck={false}
                />
                <div className="shrink-0 p-2.5 border-t border-neutral-800 flex justify-end bg-[#1e222a]">
                  <button
                    type="button"
                    onClick={() => handleRunPlaygroundCode()}
                    disabled={isRunningCode}
                    className="flex items-center space-x-1.5 bg-[#5B4DF0] hover:bg-[#4C3DE0] text-white px-4 py-1.5 rounded-lg text-xs font-sans font-semibold transition active:scale-95 cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    <span>{isRunningCode ? "Running..." : "Run Code ▶"}</span>
                  </button>
                </div>
              </div>
              {playgroundOutput && (
                <div className={`shrink-0 min-h-[80px] max-h-48 overflow-y-auto p-3 rounded-lg font-mono text-xs border whitespace-pre-wrap ${
                  isLight ? "bg-slate-900 text-emerald-300 border-purple-900/20" : "bg-neutral-900 text-neutral-200 border-neutral-800"
                }`}>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Terminal Output</div>
                  {playgroundOutput}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW B: DEDICATED CONTENT SECTION (Neat, All 8 Modules)  */}
      {/* ======================================================== */}
      {activeTab === "content" && (
        <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col space-y-4 mt-1 scrollbar-thin">
          {/* Top Course Progress Header Banner */}
          <div
            className={`rounded-2xl p-5 border shadow-sm ${
              studioTheme === "dark"
                ? "bg-[#111111] border-white/[0.08] text-white"
                : "bg-white border-[#eae7df] text-neutral-900"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-[#cebdff] font-mono text-[10.5px] font-bold uppercase tracking-wider border border-purple-500/30">
                    Comprehensive Curriculum
                  </span>
                  <span className={`text-xs font-medium ${isLight ? "text-slate-600" : "text-neutral-400"}`}>8 Modules • 36 Lessons • 36.5 Hours Total</span>
                </div>
                <h2 className={`text-2xl font-serif font-bold transition-colors duration-300 ${
                  isLight ? "text-slate-900" : "text-white"
                }`}>
                  Python Fundamentals: Conceptual Curriculum &amp; Labs
                </h2>
                <p className={`text-xs mt-1 max-w-2xl leading-relaxed transition-colors duration-300 ${
                  isLight ? "text-slate-600" : "text-neutral-400"
                }`}>
                  Every module is structured with rigorous conceptual foundations, executable code examples, Socratic inquiries, and chapter verifications.
                </p>
              </div>

              {/* Progress Metric Pill */}
              <div className={`flex items-center gap-4 border rounded-2xl p-3.5 shrink-0 transition-colors duration-300 ${
                isLight ? "bg-purple-50/70 border-purple-100 text-purple-950" : "bg-neutral-900/80 border-white/10 text-white"
              }`}>
                <div className="text-right">
                  <div className={`text-xs font-medium ${isLight ? "text-purple-700" : "text-neutral-400"}`}>Overall Progress</div>
                  <div className="text-xl font-bold font-mono text-emerald-500">42% Completed</div>
                  <div className={`text-[10px] ${isLight ? "text-purple-600/80" : "text-neutral-500"}`}>3 of 36 lessons verified</div>
                </div>
                <div className={`w-12 h-12 rounded-full border-4 border-t-emerald-500 flex items-center justify-center font-mono font-bold text-xs ${
                  isLight ? "border-purple-200 text-purple-950" : "border-neutral-800 text-white"
                }`}>
                  42%
                </div>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full bg-neutral-800 h-2 rounded-full mt-4 overflow-hidden">
              <div className="bg-[#10b981] h-2 rounded-full transition-all duration-500" style={{ width: "42%" }} />
            </div>
          </div>

          {/* 2-Column Curriculum Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column (4 Cols): Course Content Sidebar with All 8 Modules */}
            <section
              className={`lg:col-span-4 rounded-2xl p-4 border shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4 max-h-[880px] overflow-y-auto ${
                studioTheme === "dark"
                  ? "bg-[#111111] border-white/[0.08] text-neutral-200"
                  : "bg-white border-[#eae7df]"
              }`}
              data-purpose="course-content-sidebar"
            >
              <div>
                <h3 className={`text-sm font-bold ${studioTheme === "dark" ? "text-white" : "text-neutral-900"}`}>
                  Course Content
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">8 modules • 36.5 hours</p>
              </div>

              {/* Progress bar matching user screenshot */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-medium text-neutral-500">
                  <div className={`w-full rounded-full h-1.5 mr-2 overflow-hidden ${
                    studioTheme === "dark" ? "bg-neutral-800" : "bg-neutral-100"
                  }`}>
                    <div className="bg-[#10b981] h-1.5 rounded-full" style={{ width: "42%" }}></div>
                  </div>
                  <span className={`font-semibold text-xs ${studioTheme === "dark" ? "text-neutral-300" : "text-neutral-700"}`}>
                    42%
                  </span>
                </div>
              </div>

              {/* All 8 Modules in Collapsible List */}
              <div className="space-y-2 pt-1 text-xs">
                {COURSE_MODULES.map((m) => {
                  const isExpanded = !!expandedModules[m.id];
                  const isModuleActive = selectedModuleId === m.id;

                  return (
                    <div
                      key={m.id}
                      className={`border rounded-xl overflow-hidden transition ${
                        isModuleActive
                          ? "border-[#cebdff]/40 bg-[#171922]"
                          : studioTheme === "dark"
                          ? "border-neutral-800 bg-[#171922]/50 hover:border-neutral-700"
                          : "border-[#f0ece3] bg-neutral-50/40 hover:border-neutral-300"
                      }`}
                    >
                      {/* Module Title Bar */}
                      <div
                        onClick={() => toggleModule(m.id)}
                        className="flex items-center justify-between p-2.5 font-semibold cursor-pointer hover:bg-neutral-500/10 transition select-none"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white">{m.title}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-neutral-400 font-medium text-[11px]">
                          <span>{m.completedCount}</span>
                          <svg
                            className={`w-3.5 h-3.5 transform transition-transform ${isExpanded ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg>
                        </div>
                      </div>

                      {/* Expanded Lessons for this module */}
                      {isExpanded && (
                        <div className="p-2 pt-0 space-y-1">
                          {m.lessons.map((lesson, idx) => {
                            const isSelected = selectedModuleId === m.id && selectedLessonIndex === idx;

                            return (
                              <div
                                key={lesson.id}
                                onClick={() => handleSelectLesson(m.id, idx)}
                                className={`flex items-center justify-between px-2.5 py-2 rounded-lg transition cursor-pointer text-xs ${
                                  isSelected
                                    ? "bg-[#cebdff]/15 text-[#cebdff] font-semibold border border-[#cebdff]/30 shadow-xs"
                                    : lesson.completed
                                    ? "text-neutral-300 hover:bg-neutral-800/60"
                                    : "text-neutral-400 hover:bg-neutral-800/40 hover:text-neutral-200"
                                }`}
                              >
                                <div className="flex items-center space-x-2.5 min-w-0">
                                  {lesson.completed ? (
                                    <svg className="w-4 h-4 text-[#10b981] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                    </svg>
                                  ) : isSelected ? (
                                    <div className="w-4 h-4 rounded-full border-2 border-[#cebdff] flex items-center justify-center shrink-0">
                                      <div className="w-1.5 h-1.5 rounded-full bg-[#cebdff]"></div>
                                    </div>
                                  ) : (
                                    <div className="w-4 h-4 rounded-full border border-neutral-600 shrink-0"></div>
                                  )}
                                  <span className="truncate">{lesson.title}</span>
                                </div>
                                <span className="text-[10px] text-neutral-500 font-mono ml-2 shrink-0">{lesson.duration}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Chapter Concepts / Bayesian BKT Telemetry matching user screenshot */}
              <div className="pt-3 border-t border-neutral-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Bayesian BKT v2</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">P(L) ≥ 0.85</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { name: "Task Heap Queues", score: "0.94 P(L)", state: "MASTERED" },
                    { name: "Epoll Multiplexing", score: "0.91 P(L)", state: "MASTERED" },
                    { name: "Event Loop Scheduling", score: "0.76 P(L)", state: "IN_TRAINING" },
                  ].map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-lg text-xs border bg-[#171922] border-neutral-800"
                    >
                      <span className="truncate font-medium text-neutral-300">{c.name}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {c.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Right Column (8 Cols): Rich Interactive Lesson Content Reader */}
            <section
              className={`lg:col-span-8 rounded-2xl p-6 border shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6 ${
                studioTheme === "dark"
                  ? "bg-[#111111] border-white/[0.08] text-neutral-200"
                  : "bg-white border-[#eae7df]"
              }`}
            >
              {/* Lesson Title Header */}
              <div className="border-b border-neutral-800 pb-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-xs font-mono text-purple-300 uppercase tracking-wider">
                    {currentModule.title} • Lesson {selectedLessonIndex + 1} of {currentModule.lessons.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                      ⏱ {currentLesson.duration}
                    </span>
                    {currentLesson.completed ? (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        ✓ Verified
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                        In Progress
                      </span>
                    )}
                  </div>
                </div>

                <h2 className={`text-2xl sm:text-3xl font-serif font-bold tracking-tight transition-colors duration-300 ${
                  isLight ? "text-slate-900" : "text-white"
                }`}>
                  {currentLesson.title}
                </h2>
              </div>

              {/* Lesson Conceptual Overview */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Conceptual Overview
                </h4>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  {currentLesson.overview}
                </p>
              </div>

              {/* Learning Objectives */}
              <div className="p-4 rounded-xl bg-[#171922] border border-neutral-800 space-y-2.5">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <span>🎯</span>
                  <span>Core Verification Objectives</span>
                </h4>
                <ul className="space-y-2 text-xs text-neutral-300">
                  {currentLesson.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Code Snippet & Executable Sandbox */}
              {currentLesson.codeSnippet && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Executable Code Lab
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setPlaygroundCode(currentLesson.codeSnippet || "");
                        handleRunPlaygroundCode(currentLesson.codeSnippet);
                      }}
                      className="px-3 py-1 rounded-md bg-[#6344e7] hover:bg-[#5234d9] text-white text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span>▶ Run in Playground</span>
                    </button>
                  </div>

                  <div className="bg-[#181a1f] rounded-xl overflow-hidden border border-neutral-800 font-mono text-xs shadow-md">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-[#21252b] border-b border-neutral-700/60 text-[11px] text-neutral-400">
                      <span>{currentLesson.id}.py</span>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(currentLesson.codeSnippet || "")}
                        className="text-neutral-400 hover:text-white transition cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                    <pre className="p-4 text-neutral-200 leading-relaxed overflow-x-auto text-[12px]">
                      <code>{currentLesson.codeSnippet}</code>
                    </pre>
                  </div>

                  {currentLesson.codeOutput && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-neutral-400">Console Output:</span>
                      <div className="p-3 rounded-lg bg-neutral-900 text-neutral-300 font-mono text-xs border border-neutral-800 whitespace-pre-wrap">
                        {currentLesson.codeOutput}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Socratic Inquiry Challenge Box */}
              {currentLesson.socraticQuestion && (
                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">✦</span>
                    <h4 className="text-xs font-bold text-[#cebdff] uppercase tracking-wider">
                      Socratic Reasoning Probe
                    </h4>
                  </div>
                  <p className="text-xs text-purple-100 leading-relaxed italic">
                    "{currentLesson.socraticQuestion}"
                  </p>
                  <button
                    type="button"
                    onClick={() => handleLaunchInTutor(currentLesson)}
                    className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-[#cebdff] border border-purple-500/40 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
                  >
                    <span>Discuss this with AI Tutor</span>
                    <span>→</span>
                  </button>
                </div>
              )}

              {/* Lesson Step Navigation Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  disabled={selectedLessonIndex === 0 && selectedModuleId === "mod-1"}
                  onClick={() => {
                    if (selectedLessonIndex > 0) {
                      setSelectedLessonIndex(selectedLessonIndex - 1);
                    } else {
                      const modIdx = COURSE_MODULES.findIndex((m) => m.id === selectedModuleId);
                      if (modIdx > 0) {
                        const prevMod = COURSE_MODULES[modIdx - 1];
                        setSelectedModuleId(prevMod.id);
                        setSelectedLessonIndex(prevMod.lessons.length - 1);
                      }
                    }
                  }}
                  className="px-4 py-2 rounded-xl border border-white/10 hover:bg-neutral-800/80 text-xs font-medium text-neutral-300 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer flex items-center gap-2"
                >
                  <span>←</span>
                  <span>Previous Lesson</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleLaunchInTutor(currentLesson)}
                    className="px-4 py-2 rounded-xl bg-[#6344e7] hover:bg-[#5234d9] text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Practice with AI Tutor</span>
                    <span>✦</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedLessonIndex < currentModule.lessons.length - 1) {
                        setSelectedLessonIndex(selectedLessonIndex + 1);
                      } else {
                        const modIdx = COURSE_MODULES.findIndex((m) => m.id === selectedModuleId);
                        if (modIdx < COURSE_MODULES.length - 1) {
                          const nextMod = COURSE_MODULES[modIdx + 1];
                          setSelectedModuleId(nextMod.id);
                          setSelectedLessonIndex(0);
                        }
                      }
                    }}
                    className="px-4 py-2 rounded-xl border border-white/10 hover:bg-neutral-800/80 text-xs font-medium text-neutral-300 transition cursor-pointer flex items-center gap-2"
                  >
                    <span>Next Lesson</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW C: PRACTICE / NOTES / RESOURCES / DISCUSSION TABS    */}
      {/* ======================================================== */}
      {activeTab === "practice" && (
        <div className={`flex-1 min-h-0 overflow-y-auto rounded-2xl p-6 border space-y-4 mt-2 transition-all duration-300 ${
          isLight ? "bg-white border-purple-900/10 text-slate-900 shadow-sm" : "bg-[#111111] border-white/[0.08] text-white"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-xl font-serif font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Interactive Python Practice Sandbox</h3>
              <p className={`text-xs mt-1 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>Run live code against unit tests, inspect stdout, and test edge cases.</p>
            </div>
            <button
              type="button"
              onClick={() => handleRunPlaygroundCode()}
              disabled={isRunningCode}
              className="px-5 py-2 rounded-xl bg-[#6344e7] hover:bg-[#5234d9] text-white text-xs font-semibold cursor-pointer"
            >
              {isRunningCode ? "Running..." : "Run Sandbox Code ▶"}
            </button>
          </div>
          <div className="bg-[#181a1f] rounded-xl overflow-hidden border border-neutral-800 font-mono text-xs">
            <textarea
              value={playgroundCode}
              onChange={(e) => setPlaygroundCode(e.target.value)}
              rows={12}
              className="w-full p-4 bg-transparent text-emerald-400 font-mono text-xs focus:outline-none resize-none leading-relaxed"
              spellCheck={false}
            />
          </div>
          {playgroundOutput && (
            <div className={`p-4 rounded-xl font-mono text-xs border ${
              isLight ? "bg-purple-50/60 text-slate-800 border-purple-200" : "bg-neutral-900 text-neutral-200 border-neutral-800"
            }`}>
              <div className={`text-[11px] mb-1 font-semibold ${isLight ? "text-purple-700" : "text-neutral-500"}`}>Execution Console Output:</div>
              {playgroundOutput}
            </div>
          )}
        </div>
      )}

      {activeTab === "notes" && (
        <div className={`flex-1 min-h-0 overflow-y-auto rounded-2xl p-6 border space-y-4 mt-2 transition-all duration-300 ${
          isLight ? "bg-white border-purple-900/10 text-slate-900 shadow-sm" : "bg-[#111111] border-white/[0.08] text-white"
        }`}>
          <h3 className={`text-xl font-serif font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Course Notes &amp; Key Synthesis</h3>
          <p className={`text-xs ${isLight ? "text-slate-600" : "text-neutral-400"}`}>Your personal architectural synthesis, rubrics, and reference notes.</p>
          <div className={`p-4 rounded-xl border text-xs space-y-3 ${
            isLight ? "bg-purple-50/60 border-purple-200 text-slate-800" : "bg-neutral-900 border-neutral-800 text-neutral-300"
          }`}>
            <h4 className={`font-bold ${isLight ? "text-purple-900" : "text-[#cebdff]"}`}>Python Reference Model Summary</h4>
            <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
              <li>Variables are pointers to heap-allocated objects, not fixed memory slots.</li>
              <li>Lists, dicts, and sets are mutable. Integers, floats, strings, and tuples are immutable.</li>
              <li>Dictionary lookups use open addressing hash tables and average O(1) complexity.</li>
              <li>Always avoid mutable default arguments in functions (`def fn(lst=[])`). Use `lst=None`.</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === "resources" && (
        <div className={`flex-1 min-h-0 overflow-y-auto rounded-2xl p-6 border space-y-4 mt-2 transition-all duration-300 ${
          isLight ? "bg-white border-purple-900/10 text-slate-900 shadow-sm" : "bg-[#111111] border-white/[0.08] text-white"
        }`}>
          <h3 className={`text-xl font-serif font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Curated Engineering Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <a href="https://docs.python.org/3/" target="_blank" rel="noreferrer" className={`p-4 rounded-xl border transition block ${
              isLight ? "bg-purple-50/60 border-purple-200 hover:border-purple-400 text-slate-900" : "bg-neutral-900 border-neutral-800 hover:border-purple-400/40 text-white"
            }`}>
              <h4 className={`text-xs font-bold ${isLight ? "text-purple-950 font-bold" : "text-white"}`}>Official Python 3.10+ Documentation</h4>
              <p className={`text-[11px] mt-1 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>Canonical reference for syntax, stdlib, and CPython internals.</p>
            </a>
            <a href="https://peps.python.org/pep-0008/" target="_blank" rel="noreferrer" className={`p-4 rounded-xl border transition block ${
              isLight ? "bg-purple-50/60 border-purple-200 hover:border-purple-400 text-slate-900" : "bg-neutral-900 border-neutral-800 hover:border-purple-400/40 text-white"
            }`}>
              <h4 className={`text-xs font-bold ${isLight ? "text-purple-950 font-bold" : "text-white"}`}>PEP 8 — Style Guide for Python Code</h4>
              <p className={`text-[11px] mt-1 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>Conventions and best practices for writing readable, maintainable Python.</p>
            </a>
          </div>
        </div>
      )}

      {activeTab === "discussion" && (
        <div className={`flex-1 min-h-0 overflow-y-auto rounded-2xl p-6 border space-y-4 mt-2 transition-all duration-300 ${
          isLight ? "bg-white border-purple-900/10 text-slate-900 shadow-sm" : "bg-[#111111] border-white/[0.08] text-white"
        }`}>
          <h3 className={`text-xl font-serif font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Candidate Cohort Discussion</h3>
          <p className={`text-xs ${isLight ? "text-slate-600" : "text-neutral-400"}`}>Discuss Socratic probes and share problem solutions with your cohort.</p>
          <div className={`p-4 rounded-xl border text-xs ${
            isLight ? "bg-purple-50/60 border-purple-200 text-slate-700" : "bg-neutral-900 border-neutral-800 text-neutral-400"
          }`}>
            No unread threads. All module discussions are up to date!
          </div>
        </div>
      )}
    </div>
  );
};
