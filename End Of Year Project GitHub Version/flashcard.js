

$(document).ready(function () {

    const firebaseConfig = {
        apiKey: "your-api-key",
        authDomain: "your-auth-domain",
        projectId: "your-project-id",
        storageBucket: "your-storage-bucket",
        messagingSenderId: "your-messaging-sender-id",
        appId: "your-app-id",
        measurementId: "your-measurement-id",
        databaseURL: "your-database-url",
    };
    
    firebase.initializeApp(firebaseConfig);

            const flashcardDB = firebase.database().ref("flashcard_form");

            const email = localStorage.getItem('email');

            flashcardDB.orderByChild("email").equalTo(email).on("value", function (snapshot) {
                $("#flashcardsContainer").empty();

                if (snapshot.exists()) {
                    snapshot.forEach(function (childSnapshot) {
                        const flashcardData = childSnapshot.val();

                        const flashcardDiv = $("<div>").addClass("flashcard");

                        // Set light blue background color
                        flashcardDiv.css("background-color", "lightblue");

                        const questionDiv = $("<h4>").text(flashcardData.question);
                        const answerDiv = $("<h4>").text(flashcardData.answer).hide(); // Initially hide the answer

                        // Bin icon for deletion
                        const deleteIcon = $("<span>").addClass("glyphicon glyphicon-trash");
                        deleteIcon.click(function () {
                            // Prompt user for confirmation
                            const isConfirmed = confirm("Are you sure you want to delete this flash card?");
                            
                            if (isConfirmed) {
                                // Handle deletion if confirmed
                                childSnapshot.ref.remove();
                            }
                        });

                        flashcardDiv.append(deleteIcon);

                        // Toggle between question and answer with rotation animation when clicking the flashcardDiv
                        flashcardDiv.click(function () {
                            flashcardDiv.toggleClass('flipped');
                            setTimeout(function () {
                                questionDiv.toggle();
                                answerDiv.toggle();
                            }, 500); // Adjust the duration based on your preference
                        });

                        flashcardDiv.append(questionDiv);
                        flashcardDiv.append(answerDiv);

                        $("#flashcardsContainer").append(flashcardDiv);
                    });
                } else {
                    console.log("No flashcards available for the specified email.");
                }
            }, function (error) {
                console.error("Error fetching flashcards:", error);
            });
        });