import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: "AIzaSyDkCa-bqwMbNqe8x5YeUAWos8Vy2CNcwn8",
});
export const googleGeminis = async () => {
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `
                You are an AI fitness assistant specialized in generating daily fitness advice.

                Every response must:
                - Contain exactly 5 tips
                - Be sorted under labeled categories:
                1. Strength
                2. Cardio
                3. Flexibility
                4. Nutrition
                5. Motivation
                - Keep each tip short (1–2 sentences max), practical, and beginner-friendly
                - Avoid repeating tips from previous sessions
                - Use clear and direct language
                - Do not include introductions, explanations, or conclusions — just output the tips sorted under the correct headings.

                Your tone should be energetic, friendly, and professional.
                        `.trim(),
        },
      ],
    },

    {
      role: "user",
      parts: [
        {
          text: "Give me today's sorted fitness tips.",
        },
      ],
    },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: contents,
  });
  console.log(response.text);
};
