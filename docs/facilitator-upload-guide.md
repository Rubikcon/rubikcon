# Facilitator Upload Guide

> A reference for everything you need to prepare before uploading a course to Rubikcon Academy.

Before you log in to the admin builder, gather all of the materials in this guide. Once you have them ready, the upload itself takes 10–20 minutes per course.

---

## How content is organized

Every course follows this three-level hierarchy:

```
Course
 └─ Module 1
     ├─ Lesson 1.1
     ├─ Lesson 1.2
     └─ Lesson 1.3
 └─ Module 2
     ├─ Lesson 2.1
     └─ Lesson 2.2
```

- **Course** — the top-level container (e.g. "Blockchain Technology for Social Impact Businesses")
- **Module** — a major section or theme (e.g. "Blockchain Theory & Fundamentals")
- **Lesson** — an individual learning unit with videos, slides, quizzes, etc.

You create them in that order: course first, then modules under it, then lessons inside each module.

---

## Part 1 — Course-level information

These fields describe the course as a whole. You're asked for them in **Step 1** of the wizard.

### Required

| Field | Format | Notes |
|---|---|---|
| **Title** | Short text (3–200 chars) | The course name learners see. Title-cased recommended. |
| **Slug** | Lowercase letters, digits, hyphens (3–100 chars) | Used in the public URL (`/course/your-slug`). Auto-generated from title but you can edit. |
| **Description** | Long text (min 10 chars) | A paragraph or two describing what the course is about and who it's for. Shown on the public course page. |

### Optional (but recommended)

| Field | Format | Notes |
|---|---|---|
| **Tagline** | Short text (max 300 chars) | A one-line hook shown under the title. Example: *"Learn Web3 from scratch"*. |
| **Level** | Beginner / Intermediate / Advanced | Shown as a badge on the course card. |
| **Estimated Duration** | Text | e.g. `"4 weeks"`, `"Self-paced"`, `"12 hours"`. |
| **Content Unit** | Lesson / Week / Module / Session / Chapter / Unit | Vocabulary for individual lessons. Defaults to "Lesson". |
| **Course Preview Video** | URL | YouTube, Vimeo, Loom, or Google Drive link. Embedded into the hero section of the course page. |
| **Course Overview Slides** | URL | Canva (use the **Embed** share link), Google Slides, or any iframe-friendly URL. Embedded on the course page. |
| **Hero Image** | URL | Direct link to an image (jpg/png/webp). Used as a background on course cards. Wide landscape (16:9) works best. |

### Preparing materials before you start

- **Slug**: have a short, memorable URL slug in mind.
- **Description**: write 2–3 sentences in a text document so you can paste cleanly.
- **Preview video**: upload it to YouTube/Vimeo/Loom and copy the shareable link.
- **Slides**: in Canva, click **Share → Embed** and copy the URL (must be the embed link, not the view link).
- **Hero image**: upload to your image host (e.g. Cloudinary, Imgur, AWS S3) and copy the direct URL.

---

## Part 2 — Module-level information

Modules are sections that group related lessons. You add them in **Step 2** of the wizard.

### Required per module

| Field | Format | Notes |
|---|---|---|
| **Title** | Short text (1–200 chars) | The module's name (e.g. "Blockchain Theory & Fundamentals"). |

### Optional per module

| Field | Format | Notes |
|---|---|---|
| **Description** | Text (max 1000 chars) | A short summary of what this module covers. |
| **Module Intro Video URL** | URL | YouTube, Vimeo, Loom, or Google Drive. Shown when the learner expands the module. |

### Preparing materials

- Decide how many modules you need before starting (most courses have 2–4).
- Have a one-line description ready for each.

---

## Part 3 — Lesson-level information

Lessons are where the actual learning happens. Each lesson is created as a **skeleton** in **Step 3** of the wizard (just a title and duration), then enriched in the **Lesson Editor** (click "Edit details →" on any lesson).

### Creating the skeleton (Step 3)

| Field | Format | Notes |
|---|---|---|
| **Lesson title** | Short text (≥3 chars) | The lesson's name. |
| **Estimated duration** | Number of minutes (1–600) | How long learners should expect to spend. |

That's it for the skeleton — the rest is filled in the Lesson Editor.

### Lesson Editor sections

When you click **"Edit details →"** on a lesson, you'll see seven sections:

---

#### Section 1 — Lesson Basics

| Field | Required? | Notes |
|---|---|---|
| **Title** | ✅ | The lesson name (can edit anytime). |
| **Hook** | Optional (max 500 chars) | A one-sentence pitch that hooks the learner. Shown on the lesson hero. |
| **What to Expect** | Optional (max 2000 chars) | What learners will encounter — videos to watch, materials to read, exercises to do. |
| **Lesson Description** | Optional (max 5000 chars) | Longer description of the lesson's written content. |
| **Duration label** | Optional | A human-friendly duration string, e.g. `"30 min"`. |
| **Estimated minutes** | Optional (1–600) | The same value as the skeleton — edit here if needed. |
| **Difficulty** | Beginner / Intermediate / Advanced | Defaults to Beginner. |

---

#### Section 2 — Topics Covered & What You'll Learn

These are two lists shown to learners as bulleted points.

| Field | Format | Notes |
|---|---|---|
| **Topics covered** | One per line | High-level topics (e.g. *"Blockchain basics"*, *"Consensus mechanisms"*). Max 20 items, each up to 200 chars. |
| **What you'll learn** (objectives) | One per line | Concrete learning outcomes (e.g. *"Understand what a blockchain is"*, *"Explain proof of stake"*). Max 20 items, each up to 500 chars. |

Tip: write 3–7 of each. Too many feels overwhelming.

---

#### Section 3 — Lesson Videos

Multiple videos per lesson are supported. Each video:

| Field | Required? | Notes |
|---|---|---|
| **Title** | ✅ | Shown in the playlist next to the video. |
| **URL** | ✅ | YouTube, Vimeo, Loom, or Google Drive. |
| **Description** | Optional | A short note about the video. |

You can re-order videos by adding them in the desired sequence (later: drag-and-drop ordering will come).

---

#### Section 4 — Lesson Content

A free-form **Markdown** body for written content. Use this for:
- Detailed notes
- Embedded links to external readings
- Step-by-step instructions
- Code snippets

Maximum: 50,000 characters.

---

#### Section 5 — Resources (Slides + Reading Materials)

**Slide Decks (multiple per lesson)**

You can add as many slide decks as needed.

| Field | Format | Notes |
|---|---|---|
| **Title** | ✅ | e.g. *"Lesson 1 — Video 1 Slides"*. |
| **URL** | ✅ | Embed URL. For Canva: **Share → Embed**. For Google Slides: use the `/embed` URL. |
| **Number of slides** | ✅ | Total slide count. |

**Reading & Reference Resources (multiple per lesson)**

Articles, docs, whitepapers, etc.

| Field | Format | Notes |
|---|---|---|
| **Title** | ✅ | e.g. *"The Original Bitcoin Whitepaper"*. |
| **Source** | ✅ | Author or publisher (e.g. *"Satoshi Nakamoto"*, *"Ethereum.org"*). |
| **URL** | ✅ | Direct link to the resource. |
| **Type** | One of: ARTICLE, DOCUMENTATION, COURSE, WHITEPAPER, VIDEO, INTERACTIVE | Used to show an appropriate icon. |
| **Description** | Optional (max 2000 chars) | What learners will find at the link. |

---

#### Section 6 — Glossary

Key vocabulary learners can save and reference.

| Field | Format | Notes |
|---|---|---|
| **Term** | ✅ Short text (1–200 chars) | e.g. *"Smart Contract"*. Must be unique within a lesson. |
| **Definition** | ✅ Text (1–2000 chars) | One or two sentences. |
| **Example** | Optional (max 2000 chars) | Usage in context. |

Suggested: 5–15 terms per lesson.

---

#### Section 7 — Quiz

Optional. One quiz per lesson, with up to 30 questions.

**Quiz settings**

| Field | Format | Notes |
|---|---|---|
| **Title** | ✅ (3–200 chars) | e.g. *"Blockchain Fundamentals Quiz"*. |
| **Pass mark** | 1–100 (% correct needed to pass) | Default: 70. |
| **Attempt limit** | 1–10 | How many times a learner can attempt the quiz. Default: 1. |

**Each question**

| Field | Format | Notes |
|---|---|---|
| **Prompt** | ✅ Text (5–2000 chars) | The question itself. |
| **Options** | ✅ 2–8 per question | Each is a label + a "correct" flag. At least one must be correct. |
| **Single-correct vs multi-correct** | UI choice | Click the circle for single-correct; tick the "multi" checkbox for multi-answer. |
| **Explanation** | Optional (max 2000 chars) | Shown to learners after they answer. |

---

#### Section 8 — Assignments

Optional. Multiple assignments per lesson.

| Field | Format | Notes |
|---|---|---|
| **Title** | ✅ (3–200 chars) | e.g. *"Build your first smart contract"*. |
| **Instructions** | ✅ (10–10000 chars) | What learners need to do, deliverables, grading criteria. |
| **Deadline** | ✅ Date and time | When the assignment is due. |
| **Text submission** | Toggle | If on, learners can submit a text response. |
| **File upload** | Toggle | If on, learners can upload a file. |
| **Choices** | Optional (up to 10) | Sub-task options learners can pick from. Each has its own title + description. |

At least one of `Text submission` / `File upload` must be on.

---

## Workflow tips

1. **Outline first** — sketch the full course on paper before opening the builder. Title, modules, and lesson titles should be locked in.
2. **Prepare URLs in a doc** — slide embed URLs, video URLs, image URLs, reading links. The builder is much faster when you can copy/paste rather than hunt-and-fetch.
3. **Skeleton everything, then enrich** — create all modules and all lesson skeletons first, then go back and fill in content. This helps you keep an even pace across the course.
4. **Save often** — each section has its own save button. There's no "save the whole course" button; changes are saved per section as you go.
5. **Add facilitators last** — the "Submit for Review" flow lives in the completion modal. From there you can also add yourself or co-facilitators to the course.

## Publishing

When you've finished:

1. From the wizard's final step, click **Finish Course Setup**.
2. The completion modal appears. Add facilitators (search and select from existing system facilitators).
3. Click **Submit for Review**.
4. A super admin reviews and approves your course.
5. Once approved, the course is published and visible to learners.

If you edit an already-approved course, it automatically goes back to **Pending Review** for re-approval by a super admin.

## Need new system facilitators?

If the facilitator you need isn't in the search dropdown, contact a **super admin** to add them under **Admin → Facilitators**. Each facilitator needs: name, title, organization, email, LinkedIn URL, and (optionally) a photo + bio.

---

## Cheat sheet — what to gather before you start

Before opening the builder, have a folder ready with:

- [ ] Course title and 2–3 sentence description
- [ ] Course URL slug
- [ ] Course preview video (YouTube/Vimeo/Loom/Drive link)
- [ ] Course overview slide deck (Canva embed link or Google Slides)
- [ ] Course hero image (direct URL)
- [ ] List of modules with titles + short descriptions + intro video URLs (if any)
- [ ] For each lesson:
  - [ ] Title and estimated minutes
  - [ ] Hook, what-to-expect, description
  - [ ] List of topics covered
  - [ ] List of learning objectives
  - [ ] All video URLs
  - [ ] Lesson slide deck URLs
  - [ ] Reading material URLs (with author/source for each)
  - [ ] Glossary terms with definitions
  - [ ] Quiz questions with options and correct answers
  - [ ] Assignment instructions, deadlines, and submission types

---

*Last updated: 2026-05-13*
