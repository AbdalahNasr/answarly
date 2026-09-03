# Answerly — Technical Guidelines

These guidelines ensure consistency across the project. All contributors must follow them.

---

## 🎨 UI & Animation Stack

### ✅ Allowed Libraries

| Library | Usage | Install |
|---------|-------|---------|
| **shadcn/ui** | Core UI components | `npx shadcn@latest add <component>` |
| **Magic UI** ([magicui.design](https://magicui.design)) | Animated UI components | `npx magicui@latest add <component>` |
| **Aceternity UI** ([ui.aceternity.com](https://ui.aceternity.com)) | Premium animated components | Copy-paste from docs |
| **Framer Motion** | Page transitions, micro-interactions | `npm install framer-motion` |
| **GSAP** | Canvas/WebGL/scroll animations | Already installed |
| **Tailwind CSS v4** | Utility-first styling | Already installed |

> Magic UI and Aceternity UI are built on top of shadcn/ui and Tailwind — no design system conflicts.

### ❌ Banned Libraries

| Library | Reason |
|---------|--------|
| **MUI (Material UI)** | Conflicts with shadcn/Tailwind design system |
| **Chakra UI** | Conflicts with shadcn/Tailwind design system |
| **Ant Design** | Conflicts with shadcn/Tailwind design system |

These libraries use their own styling engines and token systems, which clash with our Tailwind-based stack.

---

## 📸 Media Uploads (Images, GIFs, Videos)

### Required Solution: Cloudinary

**Cloudinary is the only allowed solution for media storage.**

Local filesystem storage **must never** be used — files stored on the server filesystem will not persist across deployments on Vercel.

### Packages

```bash
npm install next-cloudinary cloudinary
```

- `next-cloudinary` — Client-side upload widget and `<CldImage>` component
- `cloudinary` — Server-side SDK for signed uploads and transformations

### Environment Variables

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Usage Patterns

**Client-side upload (preferred for user-facing forms):**
```tsx
import { CldUploadWidget, CldImage } from "next-cloudinary";

<CldUploadWidget uploadPreset="answerly_unsigned" onSuccess={handleUpload}>
  {({ open }) => <button onClick={() => open()}>Upload Image</button>}
</CldUploadWidget>
```

**Server-side signed upload (for API routes):**
```ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const result = await cloudinary.uploader.upload(filePath, {
  folder: "answerly",
});
```

### Next.js Image Config

Cloudinary domains must be allowed in `next.config.mjs`:

```js
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "res.cloudinary.com",
    },
  ],
},
```

---

## 🤖 AI API Calls (Hugging Face)

### Constraint: Vercel 10-Second Timeout

Vercel's free plan enforces a **10-second timeout** on serverless functions. AI inference calls often exceed this.

### Solution: Client-Side or Streaming

**Option 1 — Client-side fetch (simplest):**
```ts
const response = await fetch(
  "https://api-inference.huggingface.co/models/your-model",
  {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_HF_TOKEN}` },
    body: JSON.stringify({ inputs: "your prompt" }),
  }
);
```

**Option 2 — Edge runtime streaming (recommended for server-side):**
```ts
// app/api/ai/route.ts
export const runtime = "edge";

export async function POST(req: Request) {
  const { prompt } = await req.json();
  
  const response = await fetch(
    "https://api-inference.huggingface.co/models/your-model",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` },
      body: JSON.stringify({ inputs: prompt }),
    }
  );

  // Stream the response back
  return new Response(response.body, {
    headers: { "Content-Type": "application/json" },
  });
}
```

> [!IMPORTANT]
> Never use the default Node.js serverless runtime for long-running AI calls.
> Always use `export const runtime = "edge"` or make the call client-side.

---

## 📋 Quick Reference

| Category | Rule |
|----------|------|
| UI components | shadcn/ui + Magic UI + Aceternity UI only |
| Animations | Framer Motion + GSAP |
| Styling | Tailwind CSS v4 (no other CSS frameworks) |
| Media storage | Cloudinary only (no local filesystem) |
| AI calls | Client-side or Edge streaming (no default serverless) |
| Banned | MUI, Chakra UI, Ant Design |

---

*Last updated: 2026-03-08*
