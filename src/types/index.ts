export interface Language {
    code: string;
    name: string;
    flag: string;
}

export interface Answer {
    id: string;
    text: string;
    nextQuestionId?: string;
}

export interface Question {
    id: string;
    text: string; // HTML content from rich text
    answers: Answer[];
    subQuestions: Question[];
}

export interface Category {
    id: string;
    name: string;
    questions: Question[];
}

export const SUPPORTED_LANGUAGES: Language[] = [
    { code: 'az', name: 'Azərbaycan', flag: '🇦🇿' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];
