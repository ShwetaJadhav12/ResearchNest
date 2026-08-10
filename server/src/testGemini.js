import "dotenv/config";
import { testGemini } from "./services/paperAIService.js";

const result = await testGemini();

console.log(result);