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

export function getSystemMessage(context: string): string {
  const config = loadPrompt();

  // Convert the complex YAML object into a readable text format for the system prompt
  const mainPrompt = typeof config === "string" ? config : JSON.stringify(config, null, 2);

  return `Follow these instructions and behavioral guidelines strictly:\n\n${mainPrompt}\n\nRetrieved Context to use for the user's question:\n${context}`;
}
