import { useState } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { GripVertical, Trash2, Plus, Edit2 } from 'lucide-react'

export type DraggableItem = {
  id: string
  title: string
  url?: string
  description?: string
  position?: number
}

interface DraggableVideoListProps {
  items: DraggableItem[]
  onReorder: (items: DraggableItem[]) => void
  onDelete: (id: string) => void
  onEdit?: (item: DraggableItem) => void
  onAdd?: () => void
  label: string
  emptyMessage?: string
}

export default function DraggableVideoList({
  items,
  onReorder,
  onDelete,
  onEdit,
  onAdd,
  label,
  emptyMessage = 'No items yet',
}: DraggableVideoListProps) {
  const [isDragging, setIsDragging] = useState(false)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{label}</h3>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#F5C518]/30 bg-[#F5C518]/10 text-[#F5C518] hover:bg-[#F5C518]/20 transition-colors"
          >
            <Plus size={12} /> Add {label.toLowerCase()}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/20 px-4 py-6 text-center">
          <p className="text-sm text-white/40">{emptyMessage}</p>
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={items}
          onReorder={onReorder}
          onMouseEnter={() => setIsDragging(true)}
          onMouseLeave={() => setIsDragging(false)}
          className="space-y-2"
        >
          <AnimatePresence>
            {items.map((item, idx) => (
              <Reorder.Item
                key={item.id}
                value={item}
                className="cursor-grab active:cursor-grabbing"
              >
                <motion.div
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="group rounded-lg border border-white/10 bg-black/30 p-3 flex items-center gap-3 hover:border-white/20 transition-colors"
                >
                  <div className="flex-shrink-0 text-white/30 group-hover:text-white/60 cursor-grab active:cursor-grabbing transition-colors">
                    <GripVertical size={16} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-white/40 text-xs font-semibold flex-shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-sm font-medium text-white truncate">{item.title}</p>
                    </div>
                    {item.description && (
                      <p className="text-xs text-white/40 line-clamp-1 ml-7">{item.description}</p>
                    )}
                    {item.url && (
                      <p className="text-xs text-white/30 line-clamp-1 ml-7 font-mono">
                        {new URL(item.url).hostname}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="p-1.5 text-white/40 hover:text-[#F5C518] hover:bg-[#F5C518]/10 rounded transition-colors"
                        title="Edit item"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      title="Delete item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      )}
    </div>
  )
}
