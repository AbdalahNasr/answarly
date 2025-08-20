"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, Plus, Edit, Trash2, Folder, FolderOpen } from "lucide-react"
import Reveal from "@/components/reveal"
import { fetchCategoryTree, createCategory, updateCategory, deleteCategory, type Category } from "@/lib/categories"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  
  // Form states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: ''
  })

  // Load categories
  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const tree = await fetchCategoryTree()
      setCategories(tree)
    } catch (err) {
      console.error('Failed to load categories:', err)
      setError('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const handleCreateCategory = async () => {
    try {
      const newCategory = await createCategory(
        formData.name,
        formData.description,
        formData.parentId || undefined
      )
      if (newCategory) {
        setIsCreateDialogOpen(false)
        setFormData({ name: '', description: '', parentId: '' })
        await loadCategories()
      }
    } catch (err) {
      console.error('Failed to create category:', err)
      setError('Failed to create category')
    }
  }

  const handleEditCategory = async () => {
    if (!editingCategory) return
    
    try {
      const updatedCategory = await updateCategory(
        editingCategory._id!,
        formData.name,
        formData.description
      )
      if (updatedCategory) {
        setIsEditDialogOpen(false)
        setEditingCategory(null)
        setFormData({ name: '', description: '', parentId: '' })
        await loadCategories()
      }
    } catch (err) {
      console.error('Failed to update category:', err)
      setError('Failed to update category')
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    
    try {
      const success = await deleteCategory(categoryId)
      if (success) {
        await loadCategories()
      }
    } catch (err) {
      console.error('Failed to delete category:', err)
      setError('Failed to delete category')
    }
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      parentId: category.parent || ''
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({ name: '', description: '', parentId: '' })
    setEditingCategory(null)
  }

  const renderCategoryTree = (categoryList: Category[], level: number = 0) => {
    return categoryList.map((category) => {
      const hasChildren = category.children && category.children.length > 0
      const isExpanded = expandedCategories.has(category._id!)
      
      return (
        <div key={category._id} className="space-y-2">
          <div className={`flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-white/5 ${level > 0 ? 'ml-6' : ''}`}>
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpanded(category._id!)}
                className="h-6 w-6 p-0"
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            ) : (
              <div className="w-6" />
            )}
            
            <div className="flex items-center gap-2">
              {hasChildren ? (
                isExpanded ? <FolderOpen className="h-4 w-4 text-blue-500" /> : <Folder className="h-4 w-4 text-blue-500" />
              ) : (
                <div className="h-4 w-4 rounded-full bg-zinc-300 dark:bg-zinc-600" />
              )}
              
              <span className="font-medium">{category.name}</span>
              <Badge variant="secondary" className="text-xs">
                Level {category.level}
              </Badge>
              {category.path.length > 1 && (
                <Badge variant="outline" className="text-xs">
                  {category.path.slice(0, -1).join(' > ')}
                </Badge>
              )}
            </div>
            
            <div className="ml-auto flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFormData({ name: '', description: '', parentId: category._id! })
                  setIsCreateDialogOpen(true)
                }}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEditDialog(category)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteCategory(category._id!)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {hasChildren && isExpanded && (
            <div className="ml-6">
              {renderCategoryTree(category.children!, level + 1)}
            </div>
          )}
        </div>
      )
    })
  }

  if (loading) {
    return (
      <main>
        <section className="w-full">
          <div className="container mx-auto px-4 md:px-6 py-16 md:py-20">
            <div className="text-center">
              <p className="text-zinc-600 dark:text-zinc-400">Loading categories...</p>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main>
      <section className="w-full">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-20">
          <Reveal>
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {"Category Management"}
                </h1>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                  {"Create and manage hierarchical categories for organizing quiz questions."}
                </p>
              </div>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-full text-white bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-pink-600 hover:from-fuchsia-500 hover:via-indigo-500 hover:to-pink-500">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Category</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter category name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter category description"
                      />
                    </div>
                    <div>
                      <Label htmlFor="parent">Parent Category (Optional)</Label>
                      <Select value={formData.parentId} onValueChange={(value) => setFormData({ ...formData, parentId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No Parent (Root Category)</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat._id} value={cat._id!}>
                              {cat.path.join(' > ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateCategory} className="flex-1">
                        Create Category
                      </Button>
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </Reveal>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="mt-8">
            <Card className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10 shadow-sm">
              <span className="pointer-events-none absolute -inset-1 opacity-0 sm:opacity-100 bg-gradient-to-br from-fuchsia-500/10 via-indigo-500/10 to-pink-500/10" />
              <CardHeader className="relative">
                <CardTitle className="text-xl">{"Category Hierarchy"}</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                {categories.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-zinc-600 dark:text-zinc-400">No categories found. Create your first category to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {renderCategoryTree(categories)}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter category name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter category description"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleEditCategory} className="flex-1">
                    Update Category
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>
    </main>
  )
}
