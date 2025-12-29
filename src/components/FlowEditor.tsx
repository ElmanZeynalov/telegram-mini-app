'use client';

import { useState } from 'react';
import { useFlowStore } from '@/store/flowStore';
import { cn } from '@/lib/utils';
import { MessageSquare, Plus, Globe, Bold, Italic, Link, Code, Edit2, Trash2, GripVertical, AlertCircle, FileText, Heading2, List, HelpCircle, X, CheckCircle, ChevronDown, ChevronRight, CornerDownRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question } from '@/types';

// --- Components ---

function Toolbar({ hint }: { hint?: string }) {
    return (
        <div className="flex items-center gap-1 px-2 py-2 border-b border-[#333] bg-[#161616]">
            <button className="p-1.5 text-gray-400 hover:text-white hover:bg-[#252525] rounded"><Bold size={14} /></button>
            <button className="p-1.5 text-gray-400 hover:text-white hover:bg-[#252525] rounded"><Italic size={14} /></button>
            <button className="p-1.5 text-gray-400 hover:text-white hover:bg-[#252525] rounded"><Link size={14} /></button>
            <button className="p-1.5 text-gray-400 hover:text-white hover:bg-[#252525] rounded"><Code size={14} /></button>
            <div className="flex-1" />
            {hint && <span className="text-xs text-gray-500 px-2">{hint}</span>}
        </div>
    );
}

function QuestionItem({ question, categoryId, index, level = 0 }: { question: Question, categoryId: string, index: number, level?: number }) {
    const { deleteQuestion, updateQuestion, addAnswer, addQuestion, currentLanguage } = useFlowStore();

    const [isEditing, setIsEditing] = useState(false);
    const [editingText, setEditingText] = useState(question.text);

    // Composers state
    const [activeComposer, setActiveComposer] = useState<'answer' | 'subQuestion' | null>(null);
    const [composerText, setComposerText] = useState('');

    const [showSubQuestions, setShowSubQuestions] = useState(true);

    const hasAnswers = question.answers && question.answers.length > 0;
    const hasSubQuestions = question.subQuestions && question.subQuestions.length > 0;

    const handleSaveEdit = () => {
        updateQuestion(categoryId, question.id, { text: editingText });
        setIsEditing(false);
    };

    const handleAddAnswer = () => {
        if (composerText.trim()) {
            addAnswer(categoryId, question.id, composerText);
            setComposerText('');
            setActiveComposer(null);
        }
    };

    const handleAddSubQuestion = () => {
        if (composerText.trim()) {
            addQuestion(categoryId, composerText, question.id);
            setComposerText('');
            // Keep composer open? Reference says "Done" button closes it.
            // But usually "Add" adds and clears.
        }
    };

    return (
        <div className={cn("flex flex-col", level > 0 && "ml-8 relative")}>
            {level > 0 && (
                <div className="absolute -left-6 top-6 w-6 h-px bg-[#333] rounded-bl-xl border-l border-b border-[#333] !border-t-0 !border-r-0" />
                // Simple connector line visualization could be improved
            )}

            <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="group bg-[#111111] border border-[#222] rounded-xl p-5 hover:border-[#333] transition-colors relative z-10"
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center gap-1 mt-1 text-gray-600">
                            <GripVertical size={16} className="cursor-grab hover:text-gray-400" />
                        </div>

                        <div className="space-y-3 flex-1 min-w-[300px]">
                            {/* Content Header / Edit Mode */}
                            <div className="flex items-center gap-3 w-full">
                                {isEditing ? (
                                    <div className="flex-1 space-y-2">
                                        <div className="bg-[#0a0a0a] border border-[#333] rounded-md overflow-hidden focus-within:border-blue-600 transition-colors">
                                            <textarea
                                                autoFocus
                                                value={editingText}
                                                onChange={(e) => setEditingText(e.target.value)}
                                                className="w-full h-20 bg-transparent text-sm text-gray-200 p-3 outline-none resize-none placeholder:text-gray-600 font-mono"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={handleSaveEdit}
                                                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="text-xs text-gray-400 hover:text-white px-2"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <span className="text-white font-medium text-lg line-clamp-1 break-all">
                                            {question.text ? question.text.replace(/<[^>]*>/g, '') : 'New Question'}
                                        </span>
                                        <div className="flex items-center gap-1.5 bg-[#2A1805] text-[#FF9500] text-[10px] px-2 py-0.5 rounded-full border border-[#FF9500]/20 shrink-0">
                                            <Globe size={10} />
                                            <span className="font-mono">{level + 1}.{index + 1}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Badges */}
                            <div className="flex items-center gap-2">
                                {hasAnswers ? (
                                    <div className="flex items-center gap-1.5 text-emerald-500 text-xs px-2 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 w-fit">
                                        <CheckCircle size={12} />
                                        <span>Has answer</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-[#FF9500] text-xs px-2 py-1 rounded-lg border border-[#FF9500]/30 bg-[#FF9500]/10 w-fit">
                                        <AlertCircle size={12} />
                                        <span>Needs content</span>
                                    </div>
                                )}

                                {hasSubQuestions && (
                                    <button
                                        onClick={() => setShowSubQuestions(!showSubQuestions)}
                                        className="flex items-center gap-1.5 text-blue-400 text-xs px-2 py-1 rounded-lg border border-blue-500/30 bg-blue-500/10 w-fit hover:bg-blue-500/20 transition-colors"
                                    >
                                        <CornerDownRight size={12} />
                                        <span>{question.subQuestions.length} Sub-Questions</span>
                                        {showSubQuestions ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => deleteQuestion(categoryId, question.id)}
                        className="text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-2"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-6">
                    <button
                        onClick={() => {
                            if (activeComposer === 'answer') setActiveComposer(null);
                            else { setActiveComposer('answer'); setComposerText(''); }
                        }}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs transition-colors",
                            activeComposer === 'answer'
                                ? "bg-blue-600 border-blue-600 text-white"
                                : "bg-[#161616] border-[#333] text-gray-300 hover:text-white hover:border-[#555]"
                        )}
                    >
                        <FileText size={14} />
                        <span>Add Answer</span>
                    </button>
                    <button
                        onClick={() => {
                            if (activeComposer === 'subQuestion') setActiveComposer(null);
                            else { setActiveComposer('subQuestion'); setComposerText(''); }
                        }}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs transition-colors",
                            activeComposer === 'subQuestion'
                                ? "bg-blue-600 border-blue-600 text-white"
                                : "bg-[#161616] border-[#333] text-gray-300 hover:text-white hover:border-[#555]"
                        )}
                    >
                        <Plus size={14} />
                        <span>Add Sub-Question</span>
                    </button>
                    <button
                        onClick={() => { setIsEditing(true); setEditingText(question.text); setActiveComposer(null); }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#161616] border border-[#333] rounded-lg text-xs text-gray-300 hover:text-white hover:border-[#555] transition-colors"
                    >
                        <Edit2 size={14} />
                        <span>Edit</span>
                    </button>
                </div>

                {/* Composers */}
                <AnimatePresence>
                    {activeComposer && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-4 pt-4 border-t border-[#222]">
                                <div className="flex items-center gap-2 mb-2 text-sm font-medium text-white">
                                    {activeComposer === 'answer' ? <FileText size={16} /> : <Plus size={16} />}
                                    <span>{activeComposer === 'answer' ? 'Answer' : 'Add Sub-Question'} ({currentLanguage.name})</span>
                                </div>
                                <div className="bg-[#111] border border-[#333] rounded-lg overflow-hidden focus-within:border-blue-600 transition-colors">
                                    <Toolbar hint="Ctrl+Enter to submit" />
                                    <textarea
                                        autoFocus
                                        value={composerText}
                                        onChange={(e) => setComposerText(e.target.value)}
                                        className="w-full h-24 bg-transparent text-sm text-gray-200 p-4 outline-none resize-none placeholder:text-gray-600 font-mono"
                                        placeholder={activeComposer === 'answer' ? "Enter answer..." : "Type sub-question..."}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && e.ctrlKey) {
                                                activeComposer === 'answer' ? handleAddAnswer() : handleAddSubQuestion();
                                            }
                                        }}
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-4 items-center">
                                    <button
                                        onClick={activeComposer === 'answer' ? handleAddAnswer : handleAddSubQuestion}
                                        disabled={!composerText.trim()}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Add
                                    </button>
                                    <button
                                        onClick={() => setActiveComposer(null)}
                                        className="text-sm font-medium text-white hover:text-gray-300 transition-colors px-2"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Answers List */}
                {hasAnswers && (
                    <div className="mt-4 space-y-2 pl-4 border-l-2 border-[#222]">
                        {question.answers.map(a => (
                            <div key={a.id} className="text-sm text-gray-400 bg-[#161616] px-3 py-2 rounded border border-[#222]">
                                {a.text}
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Nested Questions */}
            {hasSubQuestions && showSubQuestions && (
                <div className="mt-4 space-y-4">
                    {question.subQuestions.map((sq, idx) => (
                        <QuestionItem
                            key={sq.id}
                            question={sq}
                            categoryId={categoryId}
                            index={idx}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}


export function FlowEditor() {
    const [newQuestionText, setNewQuestionText] = useState('');
    const {
        selectedCategoryId,
        categories,
        currentLanguage,
        addQuestion,
    } = useFlowStore();

    const activeCategory = categories.find(c => c.id === selectedCategoryId);

    if (!selectedCategoryId || !activeCategory) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-4">
                    <MessageSquare size={32} className="opacity-20" />
                </div>
                <p>Select a category to start editing</p>
            </div>
        );
    }

    const handleAddNewQuestion = () => {
        if (newQuestionText.trim()) {
            addQuestion(activeCategory.id, newQuestionText);
            setNewQuestionText('');
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-black text-white relative">
            {/* Top Bar */}
            <div className="h-16 px-6 flex items-center justify-between border-b border-[#222] shrink-0">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="hover:text-white cursor-pointer transition-colors">Categories</span>
                    <span>/</span>
                    <span className="text-white font-medium">{activeCategory.name}</span>
                </div>

                <div className="flex items-center gap-2 bg-[#1a1a1a] px-3 py-1.5 rounded-full border border-[#333]">
                    <Globe size={14} className="text-blue-500" />
                    <span className="text-xs text-gray-400">Editing in:</span>
                    <span className="text-xs text-white font-medium">{currentLanguage.name}</span>
                </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto space-y-8">

                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold mb-1">{activeCategory.name}</h1>
                        <p className="text-gray-500 text-sm">Manage the conversation flow.</p>
                    </div>

                    {/* Add New Question Composer (Top) */}
                    <div className="border border-dashed border-[#333] rounded-xl p-6 bg-[#0a0a0a]">
                        <div className="flex items-center gap-2 mb-4 text-gray-300 font-medium">
                            <Plus size={18} />
                            <span>Add New Question</span>
                            <span className="text-gray-500 text-sm">({currentLanguage.flag} {currentLanguage.name})</span>
                        </div>
                        <div className="bg-[#111] border border-[#333] rounded-lg overflow-hidden focus-within:border-blue-600 transition-colors">
                            <Toolbar hint="Ctrl+Enter to submit" />
                            <textarea
                                value={newQuestionText}
                                onChange={(e) => setNewQuestionText(e.target.value)}
                                className="w-full h-32 bg-transparent text-sm text-gray-200 p-4 outline-none resize-none placeholder:text-gray-600"
                                placeholder="Type a new question with formatting..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.ctrlKey) {
                                        handleAddNewQuestion();
                                    }
                                }}
                            />
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={handleAddNewQuestion}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                <Plus size={16} />
                                Add Question
                            </button>
                        </div>
                    </div>

                    {/* Questions Grid */}
                    <div className="space-y-6">
                        {activeCategory.questions.map((q, index) => (
                            <QuestionItem
                                key={q.id}
                                question={q}
                                categoryId={activeCategory.id}
                                index={index}
                            />
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}
