"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reagir = void 0;

/**
 * Reacts to a message with a specified emoji.
 * @param {string} dest - The destination (e.g., chat ID).
 * @param {object} zok - The messaging client instance.
 * @param {object} msg - The message object to react to.
 * @param {string} emoji - The emoji to react with.
 */
async function reagir(dest, zok, msg, emoji) {
    try {
        if (!dest || !zok || !msg || !emoji) {
            throw new Error("All parameters are required");
        }
        await zok.sendMessage(dest, { react: { text: emoji, key: msg.key } });
    } catch (error) {
        console.error(`Failed to react to message: ${error.message}`);
    }
}
exports.reagir = reagir;
