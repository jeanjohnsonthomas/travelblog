document.addEventListener("DOMContentLoaded", function() {
    const chatbotIcon = document.getElementById("chatbot-icon");
    const chatbotMessage = document.getElementById("chatbot-message");

    chatbotIcon.addEventListener("click", function() {
        // Create and append overlay and modal elements
        const overlay = document.createElement("div");
        overlay.id = "chatbot-overlay";
        const modal = document.createElement("div");
        modal.classList.add("chatbot-modal");
        modal.innerHTML = chatbotMessage.innerHTML;
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Show the overlay and modal
        overlay.addEventListener("click", function() {
            overlay.remove(); // Remove overlay when clicked
        });
    });
});
