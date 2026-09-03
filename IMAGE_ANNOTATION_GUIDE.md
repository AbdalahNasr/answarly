## Image Annotation Editor - Implementation Guide

### Overview
The Image Annotation Editor adds canvas-based image annotation capabilities to Answarly's question management system. Users can now add text annotations to images with full control over positioning, font size, color, and styling.

### ✅ What's Been Completed

#### 1. **Type Definitions** (`types/media.ts`)
- Created comprehensive type definitions for annotations
- `TextAnnotation`: Text with position, styling, and font controls
- `DrawingAnnotation`: Future support for shapes and drawings
- `Annotation`: Container for all annotation types
- `Media`: Updated to include annotations field

#### 2. **ImageAnnotationEditor Component** (`components/image-annotation-editor.tsx`)
- Canvas-based editor using Konva.js and react-konva
- **Features**:
  - ✅ Text tool - click to place text annotations
  - ✅ Select tool - click to select/edit annotations
  - ✅ Delete tool - remove individual annotations
  - ✅ Color picker with hex input 
  - ✅ Font size slider (8px - 72px)
  - ✅ Text alignment (left, center, right)
  - ✅ Font weight (normal, bold)
  - ✅ Max width control for text wrapping
  - ✅ Drag to reposition annotations
  - ✅ Duplicate annotations
  - ✅ Real-time canvas preview
  - ✅ Dark mode support

#### 3. **EditQuestionAdvancedDialog Updates**
- Imported ImageAnnotationEditor component
- Added annotation handler: `updateMediaAnnotations()`
- Integrated annotation editor below caption field
- Updated Media interface to support annotations

#### 4. **MongoDB Schema Updates**
- Updated `server/models/question.model.ts`:
  - Added `ITextAnnotation` interface
  - Added `IDrawingAnnotation` interface  
  - Added `IAnnotations` interface
  - Updated `IMedia` with `annotations` field
  - Created Mongoose schema for nested annotations structure

---

### 📋 Installation Steps

#### Step 1: Install Dependencies
You'll need to install Konva.js and react-konva for the canvas editor to work:

```bash
# Using npm (if npm command is available)
npm install konva react-konva

# OR using pnpm
pnpm add konva react-konva

# OR using yarn
yarn add konva react-konva
```

If you're getting PowerShell execution policy errors, try:
- Opening a new Command Prompt (instead of PowerShell)
- Or run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

#### Step 2: Verify Installation
After installing, run your dev server to check for any build errors:

```bash
npm run dev
# or
pnpm dev
```

---

### 📝 Usage Guide

#### For Users:
1. **Access the Feature**:
   - Go to My Questions
   - Click "Edit" (advanced dialog)
   - Select an image
   - Scroll to "Image Annotations (Advanced)" section

2. **Adding Text Annotations**:
   - Click "+ Add Text" button
   - Click anywhere on the image to place text
   - Edit text, color, size in the panel below

3. **Editing Annotations**:
   - Click Select tool
   - Click annotation to select it
   - Drag to move, edit properties in panel

4. **Deleting**:
   - Click Delete tool then click annotation
   - Or click Trash icon in the editor panel

#### For Developers:
```typescript
// Import the component
import { ImageAnnotationEditor } from "@/components/image-annotation-editor";

// Use in your component
<ImageAnnotationEditor
  imageUrl={imageBase64}
  imageWidth={800}
  imageHeight={600}
  initialAnnotations={{
    textAnnotations: [...],
    drawingAnnotations: [...]
  }}
  onAnnotationsChange={(annotations) => {
    // Handle annotation changes
    updateMediaAnnotations(index, annotations);
  }}
/>
```

---

### 🗄️ Database Storage Format

Annotations are stored in MongoDB as a nested structure within media items:

```json
{
  "_id": "question_id",
  "media": [
    {
      "url": "base64_image_data",
      "type": "image",
      "position": 0,
      "caption": "Image caption",
      "width": "full",
      "annotations": {
        "textAnnotations": [
          {
            "id": "text-1234567890",
            "text": "Annotated text",
            "x": 25.5,
            "y": 30.2,
            "fontSize": 16,
            "color": "#000000",
            "fontFamily": "Arial",
            "fontWeight": "normal",
            "textAlign": "left",
            "maxWidth": 200
          }
        ],
        "drawingAnnotations": []
      }
    }
  ]
}
```

**Key Points**:
- Annotations are **metadata only** - NOT merged into the base64 image
- Positions stored as percentages (0-100) - scales with image
- Can be edited/deleted at any time without affecting original image
- Fully backwards compatible - existing questions work fine

---

### 🚀 Next Steps & Future Enhancements

#### Phase 2 (Optional):
- [ ] Drawing tools (pen, shapes)
  - Free-form drawing with pen tool
  - Rectangles, circles, lines
  - Stroke and fill colors
  - Opacity controls

- [ ] Undo/Redo functionality
  - Track annotation history
  - Use React hooks for state management

- [ ] Annotation templates
  - Pre-made labels (e.g., "Key Point", "Note")
  - Predefined colors/styles

- [ ] Collaboration features
  - Show who made which annotations
  - Timestamps
  - Comments on annotations

#### Phase 3 (Display):
- Create display component to show annotations on question cards
- Add toggle to show/hide annotations in quiz mode
- Export annotations as overlay or separate image

---

### 🔧 Troubleshooting

#### Problem: "Cannot find module 'konva'"
**Solution**: Run `npm install konva react-konva` in your project directory

#### Problem: Canvas not showing/rendering
**Solution**: Ensure image URL is valid (base64 or HTTP)

#### Problem: Annotations not saving
**Solution**: Check that API route properly handles the nested annotations structure

#### Problem: Type errors in TypeScript
**Solution**: Ensure types/media.ts is properly imported

---

### 📁 File Structure

```
components/
├── image-annotation-editor.tsx    (NEW - Canvas editor component)
└── edit-question-advanced-dialog.tsx (MODIFIED - Integration)

types/
└── media.ts                       (NEW - Type definitions)

server/models/
└── question.model.ts              (MODIFIED - Schema updates)
```

---

### 🧪 Testing Checklist

- [ ] Install Konva.js dependencies
- [ ] Build project without errors
- [ ] Navigate to My Questions
- [ ] Edit a question with existing images
- [ ] Test adding text annotation (click on image)
- [ ] Test editing text (click annotation, modify properties)
- [ ] Test color picker
- [ ] Test font size slider
- [ ] Test dragging annotations
- [ ] Test deleting annotations
- [ ] Test duplicating annotations
- [ ] Save question and verify annotations persist
- [ ] Reload page and verify annotations load correctly
- [ ] Test in dark mode
- [ ] Test with different image sizes

---

### 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify all dependencies are installed
3. Check browser console for TypeScript/runtime errors
4. Ensure MongoDB schema is updated

---

### Version Info
- **Created**: March 2026
- **Tech Stack**: Next.js 15, React, TypeScript, Konva.js, shadcn/ui
- **Status**: Core features completed, drawing tools pending
