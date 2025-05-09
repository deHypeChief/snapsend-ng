import ora from "ora";
import GOOGLE_AI from "../config/google.config";
import chalk from "chalk";

class GoogleAi{
    public static async chatWithAi(question: string) {
        const spinner = ora({
            text: "Chatting with AI...",
            color: "blue"
        }).start();

        try {
            const response = await GOOGLE_AI.models.generateContent({
                model: "gemini-2.0-flash",
                contents: question,
            });
            spinner.succeed(
                chalk.bold.greenBright(`✅ AI: `) +
                chalk.cyanBright(`Response received`) +
                chalk.dim(` - "${response.text}"`)
            );
            return response.text;
        } catch (error) {
            spinner.fail(
                chalk.bold.redBright(`❌ AI: `) +
                chalk.yellowBright(`Failed to chat with AI: `) +
                chalk.whiteBright(error instanceof Error ? error.message : "Unknown error")
            );
            throw error;
        }
    }
}


export default GoogleAi