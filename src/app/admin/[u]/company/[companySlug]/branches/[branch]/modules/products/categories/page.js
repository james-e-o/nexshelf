"use client"

import { useState } from "react"
import { ChevronsUpDown, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

// ======================================================================
//  Category Table Component (JSX)
// ======================================================================

export default function CategoryTable() {
  // Accordion states for each section - all start open by default
  const [categoriesOpen, setCategoriesOpen] = useState(true)
  const [collectionsOpen, setCollectionsOpen] = useState(true)
  const [tagsOpen, setTagsOpen] = useState(true)

  // Form states
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showCollectionForm, setShowCollectionForm] = useState(false)
  const [showTagForm, setShowTagForm] = useState(false)

  return (
    <div className="space-y-4">
      {/* Categories Section */}
      <div className="border rounded-md bg-white dark:bg-neutral-900">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                setCategoriesOpen(!categoriesOpen)
                setShowCategoryForm(false)
              }}
              className="flex items-center gap-2 text-sm font-semibold hover:bg-gray-50 px-2 py-1 rounded"
            >
              Categories
              <ChevronsUpDown className="ml-0.5" size={14} />
            </button>
            <Button
              onClick={() => {
                setShowCategoryForm(!showCategoryForm)
                setCategoriesOpen(false)
              }}
              className="h-7 inline-flex items-center bg-core hover:bg-core/85 gap-2"
            >
              <Plus size={14} />
              <span className="text-xs">Add Category</span>
            </Button>
          </div>

          <p className="text-xs text-army">
    
            Categories define what the product is and where it belongs in the store. Choose the single category that best describes this product.<br />
            <em>Example: Electronics → Phones → Smartphones</em><br />
      
          </p>
        </div>

        {/* Category Form */}
        {showCategoryForm && (
          <div className="p-4 border-b bg-gray-50">
            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-sm font-medium">Category Name</label>
                <input
                  type="text"
                  placeholder="Enter category name"
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Parent Category</label>
                <select className="w-full mt-1 px-3 py-2 border rounded-md text-sm">
                  <option value="">None (Top Level)</option>
                  <option value="electronics">Electronics</option>
                  <option value="furniture">Furniture</option>
                  <option value="kitchen-appliances">Kitchen Appliances</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  placeholder="Enter category description"
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="bg-army hover:bg-army/85">
                  Create Category
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCategoryForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className={categoriesOpen ? "grid grid-rows-[1fr] transition-all duration-300" : "grid grid-rows-[0fr] transition-all duration-300"}>
          <div className="overflow-hidden">
            <div className="p-4 text-center text-gray-500">
              This is the categories section. Here you can manage your product categories.
            </div>
          </div>
        </div>
      </div>

      {/* Collections Section */}
      <div className="border rounded-md bg-white dark:bg-neutral-900">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                setCollectionsOpen(!collectionsOpen)
                setShowCollectionForm(false)
              }}
              className="flex items-center gap-2 text-sm font-bold hover:bg-gray-50 px-2 py-1 rounded"
            >
              Collections
              <ChevronsUpDown className="ml-0.5" size={14} />
            </button>
            <Button
              onClick={() => {
                setShowCollectionForm(!showCollectionForm)
                setCollectionsOpen(false)
              }}
              className="h-7 inline-flex items-center bg-core hover:bg-core/85 gap-2"
            >
              <Plus size={14} />
              <span className="text-xs">Add Collection</span>
            </Button>
          </div>

          <p className="text-xs text-army">
            Collections group products together for display, promotions, or campaigns (for example: New Arrivals, Best Sellers, Back to School).<br />
          </p>
        </div>

        {/* Collection Form */}
        {showCollectionForm && (
          <div className="p-4 border-b bg-gray-50">
            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-sm font-medium">Collection Name</label>
                <input
                  type="text"
                  placeholder="Enter collection name"
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  placeholder="Enter collection description"
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="bg-army hover:bg-army/85">
                  Create Collection
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCollectionForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className={collectionsOpen ? "grid grid-rows-[1fr] transition-all duration-300" : "grid grid-rows-[0fr] transition-all duration-300"}>
          <div className="overflow-hidden">
            <div className="p-4 text-center text-gray-500">
              This is the collections section. Here you can manage your product collections.
            </div>
          </div>
        </div>
      </div>

      {/* Tags Section */}
      <div className="border rounded-md bg-white dark:bg-neutral-900">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                setTagsOpen(!tagsOpen)
                setShowTagForm(false)
              }}
              className="flex items-center gap-2 text-sm font-semibold hover:bg-gray-50 px-2 py-1 rounded"
            >
              Tags
              <ChevronsUpDown size={14} />
            </button>
            <Button
              onClick={() => {
                setShowTagForm(!showTagForm)
                setTagsOpen(false)
              }}
              className="h-7 inline-flex items-center bg-core hover:bgcorey/85 gap-2"
            >
              <Plus size={14} />
              <span className="text-xs">Add Tag</span>
            </Button>
          </div>

          <p className="text-xs text-army">
            Tags are keywords used for search, filters, and automatic grouping (such as color, size, material, trend, or special flags).
          </p>
        </div>

        {/* Tag Form */}
        {showTagForm && (
          <div className="p-4 border-b bg-gray-50">
            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-sm font-medium">Tag Name</label>
                <input
                  type="text"
                  placeholder="Enter tag name"
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Color</label>
                <select className="w-full mt-1 px-3 py-2 border rounded-md text-sm">
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="red">Red</option>
                  <option value="yellow">Yellow</option>
                  <option value="purple">Purple</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="bg-army hover:bg-army/85">
                  Create Tag
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowTagForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className={tagsOpen ? "grid grid-rows-[1fr] transition-all duration-300" : "grid grid-rows-[0fr] transition-all duration-300"}>
          <div className="overflow-hidden">
            <div className="p-4 text-center text-gray-500">
              This is the tags section. Here you can manage your product tags.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
