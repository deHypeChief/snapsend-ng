import WHATSAPP from "../config/whatsapp.config";
import qrcode from 'qrcode-terminal';
import chalk from "chalk";
import ora from "ora";
import GoogleAi from "./googleAi.service";

class WhatsAppService {
    public static async init() {
        const spinner = ora({ text: "Initializing WhatsApp client...", color: "yellow" }).start();
        const startTime = Date.now();

        try {
            // Handle QR code generation
            WHATSAPP.on('qr', (qr) => {
                spinner.info(chalk.blueBright('📱 Scan QR code with WhatsApp'));
                qrcode.generate(qr, { small: true });
            });

            // Handle client readiness
            WHATSAPP.on('ready', () => {
                const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
                spinner.succeed(
                    chalk.bold.greenBright(`✅ WhatsApp: `) +
                    chalk.cyanBright(`Client is ready`) +
                    chalk.dim(` | Time: ${elapsedTime}s`)
                );
            });

            // Handle successful authentication
            WHATSAPP.on('authenticated', () => {
                spinner.succeed(chalk.bold.greenBright(`🔐 WhatsApp: Authentication successful`));
            });

            // Handle authentication failure
            WHATSAPP.on('auth_failure', (msg) => {
                spinner.fail(
                    chalk.bold.redBright(`❌ WhatsApp: `) +
                    chalk.yellowBright(`Authentication failed: `) +
                    chalk.whiteBright(msg)
                );
            });

            // Handle disconnection
            WHATSAPP.on('disconnected', (reason) => {
                spinner.warn(
                    chalk.bold.yellowBright(`⚠️ WhatsApp: `) +
                    chalk.whiteBright(`Disconnected - ${reason}`)
                );
            });

            // Handle chat with AI
            WHATSAPP.on('message', async (msg) => {
                const senderId = msg.from;
                const phoneNumber = senderId.split('@')[0];
                console.log(
                    chalk.bold.blueBright(`📩 Message: `) +
                    chalk.cyanBright(`${phoneNumber}`) +
                    chalk.whiteBright(` - ${msg.body}`)
                );

                // Check if message contains #ai
                if (msg.body.toLowerCase().includes('#ai')) {
                    // Remove the #ai tag from the message
                    const cleanMessage = msg.body.replace(/#ai/gi, '').trim();

                    try {
                        spinner.start(chalk.blueBright(`🤖 AI Processing request from ${phoneNumber}...`));

                        const response = await GoogleAi.chatWithAi(cleanMessage);
                        if (response) {
                            spinner.succeed(chalk.greenBright(`✨ AI Response generated for ${phoneNumber}`));
                            msg.reply(response);
                        } else {
                            spinner.fail(chalk.redBright(`❌ No response generated for ${phoneNumber}`));
                            msg.reply("Sorry, I couldn't process your request at the moment.");
                        }
                    } catch (error) {
                        spinner.fail(
                            chalk.bold.redBright(`❌ AI Chat Error: `) +
                            chalk.whiteBright(error instanceof Error ? error.message : "Unknown error")
                        );
                        console.error(
                            chalk.dim('Detailed error:'),
                            error
                        );
                        msg.reply("Sorry, I couldn't process your request at the moment.");
                    }
                }
            });


            // Handle incoming messages
            WHATSAPP.on('message', (msg) => {
                const senderId = msg.from;
                const phoneNumber = senderId.split('@')[0];
                console.log(
                    chalk.bold.blueBright(`📩 Message: `) +
                    chalk.cyanBright(`${phoneNumber}`) +
                    chalk.whiteBright(` - ${msg.body}`)
                );

                if (msg.body.toLowerCase() === 'hi') {
                    msg.reply(`Hello! Welcome to SnapSend.ng, ${phoneNumber}`);
                }
            });

            // Initialize WhatsApp
            await WHATSAPP.initialize();

        } catch (error) {
            const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
            spinner.fail(
                chalk.bold.redBright(`❌ WhatsApp: `) +
                chalk.yellowBright(`Initialization failed: `) +
                chalk.whiteBright(error instanceof Error ? error.message : "Unknown error") +
                chalk.dim(` | Time: ${elapsedTime}s`)
            );
            throw error;
        }
    }

    public static async sendMessage(to: string, message: string) {
        const spinner = ora({
            text: `Sending message to ${to}...`,
            color: "blue"
        }).start();

        try {
            // Validate phone number
            if (!to.match(/^\d+$/)) {
                throw new Error('Invalid phone number format');
            }

            // Validate message
            if (!message || message.trim().length === 0) {
                throw new Error('Message cannot be empty');
            }

            // Format phone number (remove any + or spaces)
            const formattedNumber = to.replace(/\D/g, '');

            // Check if client is ready
            if (!WHATSAPP.info) {
                throw new Error('WhatsApp client is not ready');
            }

            // Send message with retry logic
            let retries = 3;
            while (retries > 0) {
                try {
                    await WHATSAPP.sendMessage(`${formattedNumber}@c.us`, message);
                    spinner.succeed(
                        chalk.bold.greenBright(`📨 Message: `) +
                        chalk.cyanBright(`Sent to ${formattedNumber}`) +
                        chalk.dim(` - "${message}"`)
                    );
                    return;
                } catch (err) {
                    retries--;
                    if (retries === 0) throw err;
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
                }
            }
        } catch (error) {
            spinner.fail(
                chalk.bold.redBright(`❌ Message: `) +
                chalk.yellowBright(`Failed to send to ${to}: `) +
                chalk.whiteBright(error instanceof Error ? error.message : "Unknown error")
            );

            // Log detailed error for debugging
            console.error(chalk.dim('Detailed error:'), error);

            throw new Error(
                `Failed to send message: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    private static isClientReady(): boolean {
        return WHATSAPP.info !== null && WHATSAPP.info !== undefined;
    }
}

export default WhatsAppService;