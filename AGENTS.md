# vCards-TS Agents

This document defines the specialized agent roles and workflows for maintaining the `vcards-ts` project.

## Agent Roles

### vCard Maintenance Specialist

**Objective:** Maintain high-quality contact data and ensure compliance with project standards.

**Responsibilities:**

- **Data Validation:** Validate new company/service contributions against the Joi schema in `src/const/schema.ts`.
- **Image Auditing:** Ensure all logo images (`.png`) are exactly 200x200px, under 20KB, and use the PNG format.
- **Blocklist Management:** Update and enforce the exclusion list in `src/const/block.ts`.
- **Phone Validation:** Verify international and domestic phone numbers using `google-libphonenumber`.

### Build & Release Engineer

**Objective:** Automate the transformation of YAML data into usable vCard formats.

**Responsibilities:**

- **Pipeline Execution:** Manage the Gulp-based build process (`src/gulpfile.ts`).
- **Export Formats:** Generate standard `.vcf`, extended `.vcf` (for iOS/macOS), and Radicale-compatible directory structures.
- **Archive Management:** Package the generated vCards into a distribution-ready `archive.zip`.

---

## Workflows

### 1. Contributing a New Service

When adding a new service (e.g., `Example Corp`):

1. Create `data/Category/Example Corp.yaml` with the required `basic` fields (organization, cellPhone, url, workEmail).
2. Add `data/Category/Example Corp.png` (200x200px, < 20KB).
3. Run `pnpm test` to verify the schema and image specifications.
4. Run `pnpm build` to generate the `.vcf` files.

### 2. Image Optimization Workflow

If an image fails the size or format check:

1. Convert to PNG (if it's SVG or JPG).
2. Resize to exactly 200x200px.
3. Compress using tools like `optipng` or `tinypng` to stay under 20KB.

### 3. Radicale Sync Preparation

To prepare data for a Radicale CardDAV server:

1. Run `pnpm radicale`.
2. This will generate a directory structure in `radicale/ios` and `radicale/macos` with appropriate `.Radicale.props` files.

---

## Technical Standards

### YAML Schema (`src/const/schema.ts`)

- **Required:** `basic.organization`
- **Optional:** `basic.cellPhone` (Array of strings/numbers), `basic.url` (URI), `basic.workEmail` (Array of email strings).

### Image Specs

- **Format:** PNG (Required)
- **Size:** 200x200px (Strict)
- **Weight:** < 20KB (Strict)
