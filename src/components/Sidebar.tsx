'use client';

import { useFlowStore } from '@/store/flowStore';
import { cn } from '@/lib/utils';
import {
    AudioWaveform,
    Search,
    Plus,
    Trash2,
    MoreVertical,
    GripVertical,
    Edit2,
    Check,
    X
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useState, useEffect } from 'react';

export function Sidebar() {
    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => {
        setHasMounted(true);
    }, []);
    const {
        categories,
        languages,
        currentLanguage,
        setLanguage,
        addCategory,
        selectCategory,
        selectedCategoryId,
        searchQuery,
        setSearchQuery,
        updateCategory,
        deleteCategory,
        reorderCategories
    } = useFlowStore();

    const [newCategoryName, setNewCategoryName] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);

    // Edit & Menu State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    const startEditing = (id: string, name: string) => {
        setEditingId(id);
        setEditValue(name);
        setActiveMenuId(null);
    };

    const saveEdit = () => {
        if (editingId && editValue.trim()) {
            updateCategory(editingId, editValue);
            setEditingId(null);
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditValue('');
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddCategory = () => {
        if (newCategoryName.trim()) {
            addCategory(newCategoryName);
            setNewCategoryName('');
            setIsAdding(false);
        }
    };

    if (!hasMounted) return <div className="w-[300px] bg-[#111111] border-r border-[#222] h-screen" />;

    return (
        <div className="w-[300px] bg-[#111111] border-r border-[#222] flex flex-col h-screen text-white shrink-0">
            {/* Header */}
            <div className="p-4 border-b border-[#222]">
                <div className="flex items-center gap-2 mb-4">
                    <div className="bg-blue-600 p-1.5 rounded-lg">
                        <AudioWaveform size={20} className="text-white" />
                    </div>
                    <span className="font-bold text-lg">Flow Builder</span>
                </div>

                {/* Language Switcher */}
                <div className="relative">
                    <button
                        onClick={() => setIsLangOpen(!isLangOpen)}
                        className="w-full bg-[#1a1a1a] border border-[#333] hover:border-[#444] rounded-md px-3 py-2 flex items-center justify-between text-sm transition-colors"
                    >
                        <span className="flex items-center gap-2">
                            <span>{currentLanguage.flag}</span>
                            <span>{currentLanguage.name}</span>
                        </span>
                        <span className="bg-[#333] text-xs px-1.5 py-0.5 rounded text-gray-400">
                            {languages.length}
                        </span>
                    </button>

                    {isLangOpen && (
                        <div className="absolute top-full left-0 w-full mt-1 bg-[#1a1a1a] border border-[#333] rounded-md shadow-xl z-50 max-h-[300px] overflow-y-auto">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        setLanguage(lang.code);
                                        setIsLangOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-[#222] text-sm flex items-center gap-2"
                                >
                                    <span className="text-lg">{lang.flag}</span>
                                    <span>{lang.name}</span>
                                </button>
                            ))}
                            <div className="border-t border-[#333] p-2">
                                <button className="w-full text-blue-500 text-xs font-medium hover:underline">
                                    Manage All Languages
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Search & Add */}
            <div className="p-4 space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-blue-600 transition-colors"
                    />
                </div>

                {isAdding ? (
                    <div className="flex gap-2">
                        <input
                            autoFocus
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                            placeholder="Category name"
                            className="flex-1 bg-[#1a1a1a] border border-blue-600 rounded-md px-3 py-2 text-sm outline-none"
                        />
                        <button
                            onClick={handleAddCategory}
                            className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 flex items-center justify-center gap-2 text-sm font-medium transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                    >
                        <Plus size={16} />
                        Add New Category
                    </button>
                )}
            </div>

            {/* Category List */}
            <div className="flex-1 overflow-y-auto px-2 pb-4">
                <DragDropContext
                    onDragEnd={(result) => {
                        if (!result.destination) return;

                        const items = Array.from(filteredCategories);
                        const [reorderedItem] = items.splice(result.source.index, 1);
                        items.splice(result.destination.index, 0, reorderedItem);

                        if (!searchQuery) {
                            reorderCategories(items);
                        }
                    }}
                >
                    <Droppable droppableId="categories">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="space-y-1"
                            >
                                {filteredCategories.map((category, index) => (
                                    <Draggable key={category.id} draggableId={category.id} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={cn(
                                                    "relative group rounded-lg",
                                                    snapshot.isDragging && "z-50 shadow-xl opacity-90"
                                                )}
                                                style={provided.draggableProps.style}
                                            >
                                                {editingId === category.id ? (
                                                    <div className="flex items-center gap-2 px-3 py-2 bg-[#252525] rounded-lg border border-blue-600">
                                                        <input
                                                            autoFocus
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') saveEdit();
                                                                if (e.key === 'Escape') cancelEdit();
                                                            }}
                                                            className="flex-1 bg-transparent outline-none text-sm text-white"
                                                        />
                                                        <button onClick={saveEdit} className="text-green-500 hover:text-green-400">
                                                            <Check size={14} />
                                                        </button>
                                                        <button onClick={cancelEdit} className="text-red-500 hover:text-red-400">
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => selectCategory(category.id)}
                                                            className={cn(
                                                                "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all text-left",
                                                                selectedCategoryId === category.id
                                                                    ? "bg-[#252525] text-white"
                                                                    : "text-gray-400 hover:bg-[#1a1a1a] hover:text-gray-200"
                                                            )}
                                                        >
                                                            <div {...provided.dragHandleProps} className="cursor-grab text-gray-600 hover:text-white">
                                                                <GripVertical size={16} />
                                                            </div>

                                                            <div className="flex-1 truncate font-medium">
                                                                {category.name}
                                                            </div>

                                                            {/* Progress Badge */}
                                                            <div className={cn(
                                                                "text-[10px] px-1.5 py-0.5 rounded-full border",
                                                                category.questions.length > 0
                                                                    ? "border-green-800 bg-green-900/20 text-green-500"
                                                                    : "border-amber-800 bg-amber-900/20 text-amber-500"
                                                            )}>
                                                                {category.questions.length}/8
                                                            </div>

                                                            {/* Actions Trigger (Replaced with direct icons) */}
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        startEditing(category.id, category.name);
                                                                    }}
                                                                    className="p-1 hover:bg-[#333] text-gray-500 hover:text-white rounded"
                                                                    title="Edit"
                                                                >
                                                                    <Edit2 size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        deleteCategory(category.id);
                                                                    }}
                                                                    className="p-1 hover:bg-[#333] text-gray-500 hover:text-red-400 rounded"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>

            {/* User Footer */}
            <div className="p-4 border-t border-[#222]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500"></div>
                    <div className="flex-1 overflow-hidden">
                        <div className="text-sm font-medium truncate">Elman Zeynalov</div>
                        <div className="text-xs text-gray-500">Admin</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
