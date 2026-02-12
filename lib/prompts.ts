import { Mode } from "@/app/api/chat/route";
import { crisisModeText, infoModeText, operationsModeText } from "@/config/behaviour";
import fs from "fs";
import yaml from "js-yaml";
import path from "path";

export function loadPrompt(): any {
  try {
    const filePath = path.join(process.cwd(), "config", "main_prompts.yml");
    if (!fs.existsSync(filePath)) {
      return { systemMessage: "You are a helpful assistant." };
    }
    const fileContents = fs.readFileSync(filePath, "utf8");
    return yaml.load(fileContents);
  } catch (error) {
    console.error("Error loading prompt config:", error);
    return { systemMessage: "You are a helpful assistant." };
  }
}

import { LANGUAGES } from "./constants";

export function getSystemMessage(context: string, mode?: Mode, language: string = "en"): string {
  const config = loadPrompt();

  // Convert the complex YAML object into a readable text format for the system prompt
  const mainPrompt = typeof config === "string" ? config : JSON.stringify(config, null, 2);

  const languageConfig = LANGUAGES.find((l) => l.value === language) || LANGUAGES[0];
  const nativeName = languageConfig.native;

  const languageInstruction = `[LANGUAGE GUIDELINE: Primary Language is ${nativeName}]
1. DEFAULT LANGUAGE: You MUST respond in ${nativeName} by default.
2. USER OVERRIDE: If the user explicitly requests you to respond in a different language (e.g., "Answer in English", "Speak in Spanish"), you MUST honor that request and switch to the requested language.
3. LINGUISTIC PURITY: When responding in ${nativeName} (or any other requested language), maintain absolute purity:
   - Use ONLY the traditional script of the target language.
   - Do NOT use transliteration.
   - Do NOT mix English words into non-English responses (Avoid code-switching/Hinglish/Spanglish).
   - Use formal and grammatically correct vocabulary.
4. TEMPLATES: All behavioral templates below are in English. You must translate their requirements into the language you are currently using for the response.`;

  return `${languageInstruction}\n\nFollow these instructions and behavioral guidelines strictly (REMEMBER: Respond in ${nativeName} unless asked otherwise):\n\n${
    mode === "CRISIS" ? crisisModeText : mode === "OPERATIONS" ? operationsModeText : infoModeText
  }\n\n${mainPrompt}\n\nRetrieved Context to use for the user's question (TRANSLATE TO THE RESPONSE LANGUAGE):\n${context}`;
}
