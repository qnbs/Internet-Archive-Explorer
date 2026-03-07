import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAtomValue } from 'jotai';
import { libraryItemsAtom } from '@/store/favorites';
import type { LibraryItem } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import { motion } from 'framer-motion';

interface SortableLibraryItemProps {
  item: LibraryItem;
  onSelect: (item: LibraryItem) => void;
}

const SortableLibraryItem: React.FC<SortableLibraryItemProps> = ({ item, onSelect }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.identifier });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm group transition-shadow ${isDragging ? 'shadow-xl ring-2 ring-accent-500' : 'hover:shadow-md'}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-gray-300 hover:text-gray-500 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing touch-none"
        aria-label="Drag to reorder"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>

      <img
        src={`https://archive.org/services/get-item-image.php?identifier=${item.identifier}`}
        alt={item.title}
        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />

      <button className="flex-1 text-left min-w-0" onClick={() => onSelect(item)}>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{item.title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">{item.mediatype}</p>
      </button>
    </div>
  );
};

interface DraggableLibraryProps {
  onSelectItem: (item: LibraryItem) => void;
}

/**
 * A sortable library list powered by @dnd-kit.
 * Reorder is local-only (UI state) since libraryItemsAtom is a Record, not ordered array.
 */
export const DraggableLibrary: React.FC<DraggableLibraryProps> = ({ onSelectItem }) => {
  const libraryRecord = useAtomValue(libraryItemsAtom);
  const { t } = useLanguage();

  // Maintain local ordered list for drag & drop
  const [orderedIds, setOrderedIds] = useState<string[]>(() => Object.keys(libraryRecord));

  const items: LibraryItem[] = orderedIds
    .filter((id) => id in libraryRecord)
    .map((id) => libraryRecord[id] as LibraryItem);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrderedIds((ids) => {
      const oldIndex = ids.indexOf(active.id as string);
      const newIndex = ids.indexOf(over.id as string);
      return arrayMove(ids, oldIndex, newIndex);
    });
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <svg className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        <p className="text-sm">{t('library:empty') || 'Your library is empty.'}</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={orderedIds} strategy={verticalListSortingStrategy}>
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {items.map((item) => (
            <SortableLibraryItem key={item.identifier} item={item} onSelect={onSelectItem} />
          ))}
        </motion.div>
      </SortableContext>
    </DndContext>
  );
};
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAtom } from 'jotai';
import { libraryItemsAtom } from '@/store/favorites';
import type { LibraryItem } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import { motion } from 'framer-motion';

interface SortableLibraryItemProps {
  item: LibraryItem;
  onSelect: (item: LibraryItem) => void;
}

const SortableLibraryItem: React.FC<SortableLibraryItemProps> = ({ item, onSelect }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.identifier });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm group transition-shadow ${isDragging ? 'shadow-xl ring-2 ring-accent-500' : 'hover:shadow-md'}`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-gray-300 hover:text-gray-500 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing touch-none"
        aria-label="Drag to reorder"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>

      {/* Thumbnail */}
      <img
        src={`https://archive.org/services/get-item-image.php?identifier=${item.identifier}`}
        alt={item.title}
        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />

      {/* Info */}
      <button
        className="flex-1 text-left min-w-0"
        onClick={() => onSelect(item)}
      >
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{item.title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">{item.mediatype}</p>
      </button>
    </div>
  );
};

interface DraggableLibraryProps {
  onSelectItem: (item: LibraryItem) => void;
}

/**
 * A sortable library list powered by @dnd-kit.
 * Users can drag & drop items to reorder their personal library.
 */
export const DraggableLibrary: React.FC<DraggableLibraryProps> = ({ onSelectItem }) => {
  const [items, setItems] = useAtom(libraryItemsAtom);
  const { t } = useLanguage();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems((currentItems) => {
      const oldIndex = currentItems.findIndex((i) => i.identifier === active.id);
      const newIndex = currentItems.findIndex((i) => i.identifier === over.id);
      return arrayMove(currentItems, oldIndex, newIndex);
    });
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <svg className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        <p className="text-sm">{t('library:empty') || 'Your library is empty.'}</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.identifier)} strategy={verticalListSortingStrategy}>
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.04 }}
        >
          {items.map((item) => (
            <SortableLibraryItem
              key={item.identifier}
              item={item}
              onSelect={onSelectItem}
            />
          ))}
        </motion.div>
      </SortableContext>
    </DndContext>
  );
};
