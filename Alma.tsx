// Corrected streaming code to handle empty messages properly
if (message && message.content && message.content.trim() !== '') {
    chatHistory.push(message);
    updateChatDisplay(chatHistory);
} else {
    console.warn('Received an empty message or invalid content, ignoring it.');
}