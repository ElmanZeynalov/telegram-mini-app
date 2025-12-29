import { create } from 'zustand';
import { Category, Language, SUPPORTED_LANGUAGES, Question } from '@/types';

interface FlowState {
    languages: Language[];
    currentLanguage: Language;
    categories: Category[];
    selectedCategoryId: string | null;
    searchQuery: string;
    isLoading: boolean;

    // Actions
    setLanguage: (code: string) => void;
    setSearchQuery: (query: string) => void;
    fetchFlow: () => Promise<void>;

    // Category Actions
    addCategory: (name: string) => Promise<void>;
    selectCategory: (id: string) => void;
    deleteCategory: (id: string) => Promise<void>;
    reorderCategories: (newOrder: Category[]) => void; // TODO: Sync reorder with DB
    updateCategory: (id: string, name: string) => Promise<void>;

    // Question Actions
    addQuestion: (categoryId: string, text?: string, parentId?: string) => Promise<void>;
    updateQuestion: (categoryId: string, questionId: string, updates: Partial<Question>) => Promise<void>;
    deleteQuestion: (categoryId: string, questionId: string) => Promise<void>;
    addAnswer: (categoryId: string, questionId: string, text: string, file?: File) => Promise<void>;
}

// Helper to recursively update questions
const updateQuestionsRecursive = (questions: Question[], targetId: string, updateFn: (q: Question) => Question): Question[] => {
    return questions.map(q => {
        if (q.id === targetId) {
            return updateFn(q);
        }
        if (q.subQuestions && q.subQuestions.length > 0) {
            return { ...q, subQuestions: updateQuestionsRecursive(q.subQuestions, targetId, updateFn) };
        }
        return q;
    });
};

// Helper to recursively find and delete
const deleteQuestionRecursive = (questions: Question[], targetId: string): Question[] => {
    return questions.filter(q => q.id !== targetId).map(q => ({
        ...q,
        subQuestions: q.subQuestions ? deleteQuestionRecursive(q.subQuestions, targetId) : []
    }));
};

// Helper to add sub-question
const addSubQuestionRecursive = (questions: Question[], parentId: string, newQuestion: Question): Question[] => {
    return questions.map(q => {
        if (q.id === parentId) {
            return { ...q, subQuestions: [...(q.subQuestions || []), newQuestion] };
        }
        if (q.subQuestions && q.subQuestions.length > 0) {
            return { ...q, subQuestions: addSubQuestionRecursive(q.subQuestions, parentId, newQuestion) };
        }
        return q;
    });
};

export const useFlowStore = create<FlowState>((set, get) => ({
    languages: SUPPORTED_LANGUAGES,
    currentLanguage: SUPPORTED_LANGUAGES[0],
    categories: [],
    selectedCategoryId: null,
    searchQuery: '',
    isLoading: false,

    fetchFlow: async () => {
        set({ isLoading: true });
        try {
            const res = await fetch('/api/flow');
            const data = await res.json();
            if (Array.isArray(data)) {
                set({ categories: data });
                if (data.length > 0 && !get().selectedCategoryId) {
                    set({ selectedCategoryId: data[0].id });
                }
            }
        } catch (error) {
            console.error('Failed to fetch flow:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    setLanguage: (code) => set((state) => ({
        currentLanguage: state.languages.find((l) => l.code === code) || state.currentLanguage
    })),

    setSearchQuery: (query) => set({ searchQuery: query }),

    addCategory: async (name) => {
        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                body: JSON.stringify({ name }),
            });
            const newCat = await res.json();
            set((state) => ({
                categories: [...state.categories, { ...newCat, questions: [] }]
            }));
        } catch (error) {
            console.error('Add category error:', error);
        }
    },

    selectCategory: (id) => set({ selectedCategoryId: id }),

    deleteCategory: async (id) => {
        try {
            await fetch(`/api/categories/${id}`, { method: 'DELETE' });
            set((state) => ({
                categories: state.categories.filter((c) => c.id !== id),
                selectedCategoryId: state.selectedCategoryId === id ? null : state.selectedCategoryId
            }));
        } catch (error) {
            console.error('Delete category error:', error);
        }
    },

    reorderCategories: (newOrder) => set({ categories: newOrder }),

    updateCategory: async (id, name) => {
        try {
            await fetch(`/api/categories/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ name }),
            });
            set((state) => ({
                categories: state.categories.map((c) =>
                    c.id === id ? { ...c, name } : c
                )
            }));
        } catch (error) {
            console.error('Update category error:', error);
        }
    },

    addQuestion: async (categoryId, text = '', parentId) => {
        try {
            const res = await fetch('/api/questions', {
                method: 'POST',
                body: JSON.stringify({ text, categoryId, parentId }),
            });
            const newQuestion = await res.json();

            set((state) => ({
                categories: state.categories.map((c) => {
                    if (c.id !== categoryId) return c;
                    const questionWithEmptyFields = { ...newQuestion, answers: [], subQuestions: [] };
                    if (parentId) {
                        return {
                            ...c,
                            questions: addSubQuestionRecursive(c.questions, parentId, questionWithEmptyFields)
                        };
                    }
                    return { ...c, questions: [...c.questions, questionWithEmptyFields] };
                })
            }));
        } catch (error) {
            console.error('Add question error:', error);
        }
    },

    updateQuestion: async (categoryId, questionId, updates) => {
        try {
            await fetch(`/api/questions/${questionId}`, {
                method: 'PUT',
                body: JSON.stringify(updates),
            });
            set((state) => ({
                categories: state.categories.map((c) =>
                    c.id === categoryId
                        ? {
                            ...c,
                            questions: updateQuestionsRecursive(c.questions, questionId, (q) => ({ ...q, ...updates }))
                        }
                        : c
                )
            }));
        } catch (error) {
            console.error('Update question error:', error);
        }
    },

    deleteQuestion: async (categoryId, questionId) => {
        try {
            await fetch(`/api/questions/${questionId}`, { method: 'DELETE' });
            set((state) => ({
                categories: state.categories.map((c) =>
                    c.id === categoryId
                        ? { ...c, questions: deleteQuestionRecursive(c.questions, questionId) }
                        : c
                )
            }));
        } catch (error) {
            console.error('Delete question error:', error);
        }
    },

    addAnswer: async (categoryId, questionId, text, file) => {
        try {
            const formData = new FormData();
            formData.append('text', text);
            formData.append('questionId', questionId);
            if (file) {
                formData.append('file', file);
            }

            const res = await fetch('/api/answers', {
                method: 'POST',
                body: formData,
            });
            const newAnswer = await res.json();
            set((state) => ({
                categories: state.categories.map((c) =>
                    c.id === categoryId
                        ? {
                            ...c,
                            questions: updateQuestionsRecursive(c.questions, questionId, (q) => ({
                                ...q,
                                answers: [...q.answers, newAnswer]
                            }))
                        }
                        : c
                )
            }));
        } catch (error) {
            console.error('Add answer error:', error);
        }
    },
}));
