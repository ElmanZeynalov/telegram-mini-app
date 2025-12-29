'use client';

import { useState, useEffect } from 'react';
import { useFlowStore } from '@/store/flowStore';
import { ChevronRight, ChevronLeft, MessageSquare, List, HelpCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type View = 'categories' | 'questions' | 'answer';

export default function MiniAppViewer() {
    const { categories, isLoading, fetchFlow } = useFlowStore();
    const [view, setView] = useState<View>('categories');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
    const [history, setHistory] = useState<View[]>(['categories']);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        fetchFlow();
    }, [fetchFlow]);

    const selectedCategory = categories.find(c => c.id === selectedCategoryId);

    // Find question recursively
    const findQuestion = (questions: any[], id: string): any => {
        for (const q of questions) {
            if (q.id === id) return q;
            if (q.subQuestions) {
                const found = findQuestion(q.subQuestions, id);
                if (found) return found;
            }
        }
        return null;
    };

    const selectedQuestion = selectedCategory ? findQuestion(selectedCategory.questions, selectedQuestionId || '') : null;

    useEffect(() => {
        if (!isMounted) return;

        // Dynamic import to avoid SSR issues
        import('@twa-dev/sdk').then((SDK) => {
            const WebApp = SDK.default;
            WebApp.ready();

            const handleBack = () => {
                if (view === 'answer') {
                    setView('questions');
                    setSelectedQuestionId(null);
                } else if (view === 'questions') {
                    setView('categories');
                    setSelectedCategoryId(null);
                }
            };

            if (view === 'categories') {
                WebApp.BackButton.hide();
            } else {
                WebApp.BackButton.show();
                WebApp.BackButton.onClick(handleBack);
            }

            return () => {
                WebApp.BackButton.offClick(handleBack);
            };
        });
    }, [view, isMounted]);

    const navigateToQuestions = (categoryId: string) => {
        setSelectedCategoryId(categoryId);
        setView('questions');
        setHistory([...history, 'questions']);
    };

    const navigateToAnswer = (questionId: string) => {
        setSelectedQuestionId(questionId);
        setView('answer');
        setHistory([...history, 'answer']);
    };

    const goBack = () => {
        if (view === 'answer') {
            setView('questions');
            setSelectedQuestionId(null);
        } else if (view === 'questions') {
            setView('categories');
            setSelectedCategoryId(null);
        }
    };

    if (!isMounted) return <div className="min-h-screen bg-black" />;

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10 px-4 h-14 flex items-center gap-3">
                {view !== 'categories' && (
                    <button onClick={goBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                )}
                <h1 className="text-lg font-semibold tracking-tight truncate">
                    {view === 'categories' && 'Categories'}
                    {view === 'questions' && (selectedCategory?.name || 'Questions')}
                    {view === 'answer' && 'Answer'}
                </h1>
            </header>

            <main className="p-4 pb-20">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-white/40 font-medium">Loading content...</p>
                    </div>
                )}
                <AnimatePresence mode="wait">
                    {view === 'categories' && (
                        <motion.div
                            key="categories"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-3"
                        >
                            {categories.length === 0 ? (
                                <div className="text-center py-20 text-white/40">
                                    <List size={48} className="mx-auto mb-4 opacity-20" />
                                    <p>No categories found.</p>
                                </div>
                            ) : (
                                categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => navigateToQuestions(category.id)}
                                        className="w-full bg-[#111111] border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:bg-[#1a1a1a] active:scale-[0.98] transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                                <MessageSquare size={20} />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="font-medium text-white/90">{category.name}</h3>
                                                <p className="text-xs text-white/40">{category.questions.length} Questions</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-white/20 group-hover:text-white/50 transition-colors" />
                                    </button>
                                ))
                            )}
                        </motion.div>
                    )}

                    {view === 'questions' && selectedCategory && (
                        <motion.div
                            key="questions"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-3"
                        >
                            {selectedCategory.questions.length === 0 ? (
                                <div className="text-center py-20 text-white/40">
                                    <HelpCircle size={48} className="mx-auto mb-4 opacity-20" />
                                    <p>No questions in this category.</p>
                                </div>
                            ) : (
                                selectedCategory.questions.map((question) => (
                                    <button
                                        key={question.id}
                                        onClick={() => navigateToAnswer(question.id)}
                                        className="w-full bg-[#111111] border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:bg-[#1a1a1a] active:scale-[0.98] transition-all text-left"
                                    >
                                        <span className="font-medium text-white/90 line-clamp-2">{question.text.replace(/<[^>]*>/g, '')}</span>
                                        <ChevronRight size={18} className="text-white/20 shrink-0 ml-3" />
                                    </button>
                                ))
                            )}
                        </motion.div>
                    )}

                    {view === 'answer' && selectedQuestion && (
                        <motion.div
                            key="answer"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="bg-blue-500/5 border border-blue-500/20 p-5 rounded-3xl">
                                <h1 className="text-xl font-bold text-blue-400">Question</h1>
                                <p className="mt-3 text-lg leading-relaxed text-white/90">
                                    {selectedQuestion.text.replace(/<[^>]*>/g, '')}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-xs font-bold uppercase tracking-widest text-white/30 px-1">Answer</h2>
                                {selectedQuestion.answers.length > 0 ? (
                                    <div className="bg-[#111111] border border-white/5 p-6 rounded-3xl text-lg leading-relaxed text-white/80 space-y-4">
                                        {selectedQuestion.answers.map((ans: any) => (
                                            <div key={ans.id} className="last:mb-0">
                                                {ans.mediaUrl && (
                                                    <div className="mb-4">
                                                        {ans.mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                                            <div className="space-y-2">
                                                                <img
                                                                    src={ans.mediaUrl}
                                                                    alt="Answer Media"
                                                                    className="w-full rounded-2xl border border-white/10"
                                                                    loading="lazy"
                                                                />
                                                                <a
                                                                    href={ans.mediaUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                                                >
                                                                    <ArrowLeft className="rotate-[135deg]" size={14} /> {/* Using ArrowLeft as generic icon if no external link icon */}
                                                                    View Full Size
                                                                </a>
                                                            </div>
                                                        ) : (
                                                            <a
                                                                href={ans.mediaUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-xl hover:bg-white/10 transition-colors group"
                                                            >
                                                                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                                                    <List size={20} />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">Attached File</div>
                                                                    <div className="text-xs text-white/40 truncate">{ans.mediaUrl.split('/').pop()}</div>
                                                                </div>
                                                                <ChevronRight size={16} className="text-white/20" />
                                                            </a>
                                                        )}
                                                    </div>
                                                )}
                                                <div>{ans.text}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-3xl text-amber-500/80 italic">
                                        This question doesn't have an answer yet.
                                    </div>
                                )}
                            </div>

                            {/* Sub-questions as related links? */}
                            {selectedQuestion.subQuestions && selectedQuestion.subQuestions.length > 0 && (
                                <div className="space-y-4 mt-8">
                                    <h2 className="text-xs font-bold uppercase tracking-widest text-white/30 px-1">Related Questions</h2>
                                    <div className="space-y-2">
                                        {selectedQuestion.subQuestions.map((sq: any) => (
                                            <button
                                                key={sq.id}
                                                onClick={() => navigateToAnswer(sq.id)}
                                                className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all text-left"
                                            >
                                                <span className="text-sm font-medium text-white/70">{sq.text.replace(/<[^>]*>/g, '')}</span>
                                                <ChevronRight size={16} className="text-white/20 shrink-0 ml-3" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Bottom Safe Area Padding for Telegram */}
            <div className="h-20" />
        </div>
    );
}
