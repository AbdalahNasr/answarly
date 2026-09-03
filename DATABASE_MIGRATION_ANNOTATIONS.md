## Database Migration Guide - Image Annotations

### Overview
This document describes the database schema changes needed to support image annotations in Answarly.

### Schema Changes

#### Before
```javascript
media: [
  {
    url: String,           // Base64 image data
    type: String,          // "image" | "gif"
    position: Number,
    caption: String,       // Optional caption
    width: String,         // "full" | "half" | "small" | "auto"
    maxWidth: Number
  }
]
```

#### After (With Annotations)
```javascript
media: [
  {
    url: String,           // Base64 image data (unchanged)
    type: String,          // "image" | "gif" (unchanged)
    position: Number,      // (unchanged)
    caption: String,       // Optional caption (unchanged)
    width: String,         // "full" | "half" | "small" | "auto" (unchanged)
    maxWidth: Number,      // (unchanged)
    
    // NEW: Annotations metadata
    annotations: {
      textAnnotations: [
        {
          id: String,              // Unique annotation ID
          text: String,            // Annotation text content
          x: Number,               // Position X (0-100 percentage)
          y: Number,               // Position Y (0-100 percentage)
          fontSize: Number,        // Font size in pixels (default: 16)
          color: String,           // Hex color code (default: "#000000")
          fontFamily: String,      // Font name (default: "Arial")
          fontWeight: String,      // "normal" | "bold" (default: "normal")
          textAlign: String,       // "left" | "center" | "right" (default: "left")
          maxWidth: Number         // Max width in pixels (default: 200)
        }
      ],
      drawingAnnotations: [       // Future support for drawings
        {
          id: String,
          type: String,            // "pen" | "rectangle" | "circle" | "line"
          points: [[Number]],      // For pen - array of coordinates
          x: Number,               // For shapes - position
          y: Number,
          width: Number,
          height: Number,
          color: String,           // Stroke/fill color
          opacity: Number,         // 0-1 (default: 1)
          strokeWidth: Number      // Default: 2
        }
      ]
    }
  }
]
```

### Migration Steps

#### Option 1: Automatic Migration (Recommended)
No migration needed! The change is backwards compatible:
- Existing questions continue to work without annotations
- The `annotations` field is optional
- When questions don't have `annotations`, it defaults to empty/undefined

#### Option 2: Pre-populate Annotations Field
If you want to ensure all documents have the annotations field:

```javascript
// MongoDB shell script
db.questions.updateMany(
  { "media": { $exists: true } },
  [
    {
      $set: {
        "media": {
          $map: {
            input: "$media",
            as: "item",
            in: {
              $mergeObjects: [
                "$$item",
                {
                  annotations: {
                    textAnnotations: [],
                    drawingAnnotations: []
                  }
                }
              ]
            }
          }
        }
      }
    }
  ]
)
```

#### Option 3: Selective Update (For Testing)
Update only specific questions for testing:

```javascript
db.questions.updateOne(
  { _id: ObjectId("your_question_id") },
  {
    $set: {
      "media.0.annotations": {
        "textAnnotations": [],
        "drawingAnnotations": []
      }
    }
  }
)
```

### Data Safety

**Backwards Compatibility** ✅
- Existing questions work without modifications
- No data loss
- Can revert changes if needed

**Forward Compatibility** ✅
- New questions automatically include annotation structure
- Annotations layer is completely separate from image data
- Can edit/delete annotations without affecting images

**No Image Modifications** ✅
- Base64 image data (`media.url`) is never modified
- Annotations are metadata only
- Original image quality preserved

---

### Verification Steps

1. **Check existing questions still load correctly**
   ```javascript
   db.questions.findOne({ "media": { $exists: true } })
   ```

2. **Verify annotation structure after save**
   ```javascript
   db.questions.findOne({ _id: ObjectId("...") }, { "media.annotations": 1 })
   ```

3. **Count questions with annotations**
   ```javascript
   db.questions.countDocuments({
     "media.annotations.textAnnotations": { $exists: true, $ne: [] }
   })
   ```

---

### Rollback Plan

If needed, you can remove the annotations field from all documents:

```javascript
// Remove annotations from all questions
db.questions.updateMany(
  {},
  [
    {
      $set: {
        "media": {
          $map: {
            input: "$media",
            as: "item",
            in: {
              $unset: ["$$item.annotations"],
              $literal: "$$item"
            }
          }
        }
      }
    }
  ]
)
```

Or simpler approach:
```javascript
db.questions.updateMany(
  { "media.annotations": { $exists: true } },
  { $unset: { "media.$[].annotations": "" } }
)
```

---

### MongoDB Schema Validation (Optional)

To enforce the schema structure, add JSON Schema validation:

```javascript
db.createCollection("questions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      properties: {
        media: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              url: { bsonType: "string" },
              type: { enum: ["image", "gif"] },
              position: { bsonType: "int" },
              caption: { bsonType: "string" },
              width: { enum: ["full", "half", "small", "auto"] },
              maxWidth: { bsonType: "int" },
              annotations: {
                bsonType: "object",
                properties: {
                  textAnnotations: {
                    bsonType: "array",
                    items: {
                      bsonType: "object",
                      properties: {
                        id: { bsonType: "string" },
                        text: { bsonType: "string" },
                        x: { bsonType: "double" },
                        y: { bsonType: "double" },
                        fontSize: { bsonType: "int" },
                        color: { bsonType: "string" },
                        fontFamily: { bsonType: "string" },
                        fontWeight: { enum: ["normal", "bold"] },
                        textAlign: { enum: ["left", "center", "right"] },
                        maxWidth: { bsonType: "int" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
})
```

---

### Deployment Checklist

- [ ] MongoDB version supports nested documents (all versions do)
- [ ] Mongoose models updated with new schema
- [ ] API routes tested with annotations payload
- [ ] Backwards compatibility verified
- [ ] Database backups created before deployment
- [ ] Testing completed with existing questions
- [ ] New questions with annotations tested
- [ ] Frontend components deployed
- [ ] Konva.js dependencies installed

---

### Support & Questions

For questions about migration:
1. Check the examples above
2. Review the DATABASE_SCHEMA.md file
3. Test in a development database first
4. Keep backups of production data
