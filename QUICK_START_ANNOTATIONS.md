# Quick Start - Image Annotation Editor

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install konva react-konva
```

### 2. Verify Files Are in Place
- ✅ `types/media.ts` - Type definitions
- ✅ `components/image-annotation-editor.tsx` - Canvas editor
- ✅ `components/edit-question-advanced-dialog.tsx` - Updated dialog
- ✅ `server/models/question.model.ts` - Schema updated

### 3. Start Dev Server
```bash
npm run dev
```

### 4. Test It
1. Go to "My Questions"
2. Click "Edit" on any question
3. Select an image
4. Scroll to "Image Annotations (Advanced)" section
5. Click "+ Add Text" and click on the image to add annotations

### 5. Save & Test
- Click "Save Changes"
- Reload page to verify annotations persist

---

## 🎨 Features at a Glance

| Feature | Status | How to Use |
|---------|--------|-----------|
| Add Text | ✅ Done | Click "+ Add Text" → Click on image |
| Edit Text | ✅ Done | Click annotation → Edit in panel below |
| Change Color | ✅ Done | Use color picker in toolbar |
| Change Font Size | ✅ Done | Use slider (8px - 72px) |
| Move Annotation | ✅ Done | Drag selected annotation |
| Delete Annotation | ✅ Done | Use Delete tool or Trash button |
| Duplicate | ✅ Done | Select annotation → Click "Copy" |
| Font Weight | ✅ Done | Normal/Bold options |
| Text Alignment | ✅ Done | Left/Center/Right options |
| Dark Mode | ✅ Done | Automatically supported |

---

## 📊 What Gets Saved

Annotations are stored **separately** from the image:

```javascript
{
  "media": [{
    "url": "base64_image_data", // Original image, never modified
    "annotations": {            // Stored separately
      "textAnnotations": [
        {
          "id": "text-1234",
          "text": "Your annotation",
          "x": 25,
          "y": 30,
          "fontSize": 16,
          "color": "#FF0000"
          // ... more properties
        }
      ]
    }
  }]
}
```

This means:
- ✅ Original image stays intact
- ✅ Annotations can be edited/deleted anytime
- ✅ Multiple annotations per image
- ✅ Fully reversible

---

## 🐛 Common Issues & Fixes

### Issue: "Cannot find module 'konva'"
```bash
npm install konva react-konva
npm run dev
```

### Issue: Canvas not showing
- Check image URL is valid
- Check browser console for errors
- Try a different image

### Issue: Annotations not saving
- Check API route handles nested structure
- Verify MongoDB schema is updated
- Check browser DevTools Network tab

### Issue: TypeScript errors
- Ensure `types/media.ts` exists
- Run `npm run build` to check all errors
- May need to restart dev server

---

## 🔄 File Changes Summary

### New Files
- `types/media.ts` - Type definitions
- `components/image-annotation-editor.tsx` - Canvas component
- `IMAGE_ANNOTATION_GUIDE.md` - Full guide
- `DATABASE_MIGRATION_ANNOTATIONS.md` - Migration guide

### Modified Files
- `components/edit-question-advanced-dialog.tsx` - Integrated editor
- `server/models/question.model.ts` - Added annotation schema

---

## 💡 Pro Tips

1. **Bulk Add Annotations**: Add multiple annotations by switching tools
2. **Precise Positioning**: Use the numbers shown in the editor panel
3. **Color Codes**: Paste hex colors (e.g., `#FF0000`) directly
4. **Text Wrapping**: Adjust "Max Width" for multi-line text
5. **Duplicate for Lists**: Use duplicate to create similar annotations

---

## 📈 Next Steps

After getting this working, consider:
- [ ] Drawing tools (pen, shapes)
- [ ] Undo/Redo
- [ ] Annotation templates
- [ ] Export annotations
- [ ] Collaboration features

---

## 📞 Need Help?

1. Read `IMAGE_ANNOTATION_GUIDE.md` for detailed docs
2. Check `DATABASE_MIGRATION_ANNOTATIONS.md` for schema info
3. Review the component source code with comments
4. Check browser console for error messages

---

**Status**: ✅ Core features complete and ready to use!
