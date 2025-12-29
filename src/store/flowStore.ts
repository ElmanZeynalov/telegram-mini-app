import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Category, Language, SUPPORTED_LANGUAGES, Question } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface FlowState {
    languages: Language[];
    currentLanguage: Language;
    categories: Category[];
    selectedCategoryId: string | null;
    searchQuery: string;

    // Actions
    setLanguage: (code: string) => void;
    setSearchQuery: (query: string) => void;

    // Category Actions
    addCategory: (name: string) => void;
    selectCategory: (id: string) => void;
    deleteCategory: (id: string) => void;
    reorderCategories: (newOrder: Category[]) => void;
    updateCategory: (id: string, name: string) => void;

    // Question Actions
    addQuestion: (categoryId: string, text?: string, parentId?: string) => void;
    updateQuestion: (categoryId: string, questionId: string, updates: Partial<Question>) => void;
    deleteQuestion: (categoryId: string, questionId: string) => void;
    addAnswer: (categoryId: string, questionId: string, text: string) => void;
}

// Mock Initial Data (Cleared for clean start)
const INITIAL_CATEGORIES: Category[] = [];

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

export const useFlowStore = create<FlowState>()(
    persist(
        (set) => ({
            languages: SUPPORTED_LANGUAGES,
            currentLanguage: SUPPORTED_LANGUAGES[0],
            categories: INITIAL_CATEGORIES,
            selectedCategoryId: null,
            searchQuery: '',

            setLanguage: (code) => set((state) => ({
                currentLanguage: state.languages.find((l) => l.code === code) || state.currentLanguage
            })),

            setSearchQuery: (query) => set({ searchQuery: query }),

            addCategory: (name) => set((state) => ({
                categories: [
                    ...state.categories,
                    { id: uuidv4(), name, questions: [] }
                ]
            })),

            selectCategory: (id) => set({ selectedCategoryId: id }),

            deleteCategory: (id) => set((state) => ({
                categories: state.categories.filter((c) => c.id !== id),
                selectedCategoryId: state.selectedCategoryId === id ? null : state.selectedCategoryId
            })),

            reorderCategories: (newOrder) => set({ categories: newOrder }),

            updateCategory: (id, name) => set((state) => ({
                categories: state.categories.map((c) =>
                    c.id === id ? { ...c, name } : c
                )
            })),

            addQuestion: (categoryId, text = '', parentId) => set((state) => {
                const newQuestion: Question = {
                    id: uuidv4(),
                    text,
                    answers: [],
                    subQuestions: []
                };

                return {
                    categories: state.categories.map((c) => {
                        if (c.id !== categoryId) return c;

                        if (parentId) {
                            return {
                                ...c,
                                questions: addSubQuestionRecursive(c.questions, parentId, newQuestion)
                            };
                        }

                        return { ...c, questions: [...c.questions, newQuestion] };
                    })
                };
            }),

            updateQuestion: (categoryId, questionId, updates) => set((state) => ({
                categories: state.categories.map((c) =>
                    c.id === categoryId
                        ? {
                            ...c,
                            questions: updateQuestionsRecursive(c.questions, questionId, (q) => ({ ...q, ...updates }))
                        }
                        : c
                )
            })),

            deleteQuestion: (categoryId, questionId) => set((state) => ({
                categories: state.categories.map((c) =>
                    c.id === categoryId
                        ? { ...c, questions: deleteQuestionRecursive(c.questions, questionId) }
                        : c
                )
            })),

            addAnswer: (categoryId, questionId, text) => set((state) => ({
                categories: state.categories.map((c) =>
                    c.id === categoryId
                        ? {
                            ...c,
                            questions: updateQuestionsRecursive(c.questions, questionId, (q) => ({
                                ...q,
                                answers: [...q.answers, { id: uuidv4(), text }]
                            }))
                        }
                        : c
                )
            })),

        }),
        {
            name: 'flow-builder-storage',
        }
    )
);
