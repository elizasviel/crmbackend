import OpenAI from "openai";

export class AIService {
  private openai: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured");
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeTicket(title: string, description: string) {
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

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("No response from AI");

      return JSON.parse(content);
    } catch (error) {
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
