

$(document).ready(function() {
    $('#input-form').submit(function(e) {
        e.preventDefault(); // Prevent default form submission

        const messageContent = $('#input-field').val();
        $('#input-field').val(''); // Clear the input field

        // Immediately append the user's message to the conversation
        $('#conversation').append(`
            <div class="user-message">
                <p class="user-text">${messageContent}</p>
            </div>
        `);
        $('#conversation').scrollTop($('#conversation')[0].scrollHeight); // Scroll to the bottom

        const message = {
            messages: [
                { role: "user", content: messageContent }
            ]
        };

        $.ajax({
            type: 'POST',
            // Use template literal to include the imported ipaddress in the request URL
            url: `http://localhost:3000/sendMessage`,
            contentType: 'application/json',
            data: JSON.stringify(message),
            success: function(response) {
                // Append the response to the conversation
                $('#conversation').append(`
                    <div class="chatbot-message">
                        <p class="chatbot-text">${response.message}</p>
                    </div>
                `);
                $('#conversation').scrollTop($('#conversation')[0].scrollHeight); // Scroll to the bottom
            },
            error: function() {
                alert('Error sending message');
            }
        });
    });
});
