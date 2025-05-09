import { GoogleGenAI } from "@google/genai";

const GOOGLE_AI = new GoogleGenAI({ apiKey: Bun.env.GOOGLE_API_KEY });

export default GOOGLE_AI;
