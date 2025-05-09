import { Client, LocalAuth } from 'whatsapp-web.js';

// Use LocalAuth to persist session data
const WHATSAPP = new Client({
    authStrategy: new LocalAuth(),
});

export default WHATSAPP;