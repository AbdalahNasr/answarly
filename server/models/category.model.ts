// server/models/category.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  description?: string;
  parent?: ICategory["_id"]; // Reference to parent category
  level: number; // 0 = main category, 1 = subcategory, 2 = topic, etc.
  path: string[]; // Array of category names from root to current
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    parent: { type: Schema.Types.ObjectId, ref: "Category" }, // Self-referencing
    level: { type: Number, default: 0, min: 0 }, // 0 = root, 1 = child, 2 = grandchild, etc.
    path: [{ type: String }], // Array of category names for easy querying
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Index for efficient querying
CategorySchema.index({ parent: 1, level: 1, isActive: 1 });
CategorySchema.index({ path: 1 });

export default mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
