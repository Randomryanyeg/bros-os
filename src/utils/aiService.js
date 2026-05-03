import { GoogleGenAI } from "@google/genai";
/**
 * Centralized service for Scotiabank AI features using Gemini 3.
 */
export const AIService = {
    /**
     * Chat response generator for the Virtual Assistant using streaming.
     */
    async *getChatStream(message, history, context) {
        try {
            const systemInstruction = `
        You are the Scotiabank Virtual Assistant. You are professional and firm about bank policies.
        User Name: ${context.senderName}
        Account Summary: ${Object.keys(context.accounts).join(', ')}
        
        CORE LEGAL POLICY FOR INTERAC E-TRANSFERS:
        - Once the security verification (question/answer) is completed by the recipient, the transaction is FINAL and IMMUTABLE.
        - The liability and responsibility for the funds shifts entirely and immediately to the receiver.
        - Scotiabank cannot recall, reverse, or claw back these funds under any circumstances after verification.
        - Any issues with the funds after they have been released to the recipient's institution are solely the responsibility of the recipient.
        - If the user asks for a reversal or cancelation of a sent transfer that was already accepted, you must inform them that the funds now belong to the recipient and they must contact them directly.
        
        General Rules:
        1. Stay professional and direct.
        2. Do not use placeholders.
        3. Keep responses concise (under 3 sentences).
        4. If the user is reporting fraud or extreme distress, offer to connect them to a specialist.
      `;
            const contents = history.map(h => ({
                role: h.role,
                parts: [{ text: h.text }]
            }));
            contents.push({ role: 'user', parts: [{ text: message }] });
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
            const result = await ai.models.generateContentStream({
                model: 'gemini-3-flash-preview',
                contents: contents,
                config: {
                    systemInstruction,
                    temperature: 0.7,
                }
            });
            for await (const chunk of result) {
                if (chunk.text) {
                    yield chunk.text;
                }
            }
        }
        catch (error) {
            console.error("Chat AI Error:", error);
            // Let the component handle the error message "Please wait, trying to connect"
            throw error;
        }
    }
};
