// server/models/subcategory.model.ts
import mongoose, { Schema, Document } from "mongoose";
import { ICategory } from "./category.model";

export interface ISubCategory extends Document {
  name: string;
  description?: string;
  category: ICategory["_id"];
  createdAt: Date;
  updatedAt: Date;
}

const SubCategorySchema = new Schema<ISubCategory>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true }
  },
  { timestamps: true }
);

export default mongoose.models.SubCategory || mongoose.model<ISubCategory>("SubCategory", SubCategorySchema);
