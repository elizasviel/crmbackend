"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const openai_1 = __importDefault(require("openai"));
class AIService {
    constructor() {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OpenAI API key not configured");
        }
        this.openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    async analyzeTicket(title, description) {
        var _a, _b;
        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `Analyze this support ticket and provide JSON output with:
            {
              "priority": "LOW|MEDIUM|HIGH|URGENT",
              "category": "string",
              "suggestedTeam": "string",
              "estimatedHours": number
            }`,
                    },
                    {
                        role: "user",
                        content: `Title: ${title}\nDescription: ${description}`,
                    },
                ],
            });
            const content = (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
            if (!content)
                throw new Error("No response from AI");
            return JSON.parse(content);
        }
        catch (error) {
            console.error("AI Analysis failed:", error);
            return {
                priority: "MEDIUM",
                category: "Unclassified",
                suggestedTeam: "General Support",
                estimatedHours: 24,
            };
        }
    }
}
exports.AIService = AIService;
