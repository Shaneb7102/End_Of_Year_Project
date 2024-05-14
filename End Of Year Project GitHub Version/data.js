
// file2.js
const variable = localStorage.getItem('email');
console.log(variable); // Outputs: Hello from file1


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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var contactFormDB = firebase.database().ref("task_form");

// Event listener for form submission
document.getElementById("saveTaskBtn").addEventListener("click", submitTask);


function submitTask() {
    var task = document.getElementById("taskDescription").value;
    var date = document.getElementById("dueDate").value;
    var desc = document.getElementById("description").value;
    var selectedValue = document.querySelector('input[name="priority"]:checked')?.value || null;
    var email = variable;
    saveMessages(task, date, desc, selectedValue, email);

    
    document.querySelector(".alert").style.display = "block";
    setTimeout(() => {
        document.querySelector(".alert").style.display = "none";
    }, 3000);

    
    document.getElementById("task_form").reset();
}

// Function to save messages to Firebase
const saveMessages = (task, date, desc, selectedValue,email) => {
    var newContactForm = contactFormDB.push();
    newContactForm.set({
        task: task,
        date: date,
        desc: desc,
        selectedValue: selectedValue,
        email:email,
    
    });
};

var flashCardDB = firebase.database().ref("flashcard_form");

// Event listener for flashcard form submission
document.getElementById("saveFlashCardBtn").addEventListener("click", submitFlashCard);

// Function to save flashcard to Firebase
const saveFlashCard = (question, answer, email) => {
    var newFlashCard = flashCardDB.push();
    newFlashCard.set({
        question: question,
        answer: answer,
        email: email,
    });
};

function submitFlashCard() {
    var question = document.getElementById("flashCardQuestion").value;
    var answer = document.getElementById("flashCardAnswer").value;
    var email = variable; // Use the retrieved email

    // Correctly call saveFlashCard to save data to flashcard_form in Firebase
    saveFlashCard(question, answer, email);

    // Additional code to manage UI feedback (e.g., alert display, form reset, modal hide)
    document.querySelector(".alert").style.display = "block";
    setTimeout(() => {
        document.querySelector(".alert").style.display = "none";
    }, 3000);

    document.getElementById("flashcard_form").reset();
    $('#myModal2').modal('hide'); // Assuming '#myModal2' is the ID of your flashcard modal
}



var phonenumberDB = firebase.database().ref("phonenumber_form");

document.getElementById("savePhoneNumberBtn").addEventListener("click", submitPhoneNumber);

// Function to handle form submission
function submitPhoneNumber() {
    var phoneNumber = document.getElementById("PhoneNumber").value;
    var email = variable; // Ensure this variable correctly holds the email value

    // First, remove existing record with the same email
    removeExistingPhoneNumber(email, () => {
        // Save the new phone number after the existing one has been removed
        savePhoneNumber(phoneNumber, email);
    });

    // Alert management
    document.querySelector(".alert").style.display = "block";
    setTimeout(() => {
        document.querySelector(".alert").style.display = "none";
    }, 3000);

    // Reset the form
    document.getElementById("phonenumber_form").reset();
}

// Function to save phone number to Firebase
const savePhoneNumber = (phoneNumber, email) => {
    var phoneForm = phonenumberDB.push();
    phoneForm.set({
        phoneNumber: phoneNumber,
        email: email,
    });
};

// Function to remove existing phone number with the same email
const removeExistingPhoneNumber = (email, callback) => {
    phonenumberDB.orderByChild("email").equalTo(email).once("value", snapshot => {
        snapshot.forEach(childSnapshot => {
            phonenumberDB.child(childSnapshot.key).remove();
        });
        if (typeof callback === "function") {
            callback(); // Proceed to save the new phone number after removal
        }
    });
};




function searchfilteredtasks() {
    var keyword = document.getElementById("searchInput").value.toLowerCase(); // Convert to lowercase for case-insensitive comparison
    var priority = document.getElementById("myComboBox").value;
    const email = variable; // Ensure this 'variable' is defined and holds the correct email value. Replace 'variable' with the actual variable name that contains the email.

    var dbRef = firebase.database().ref("task_form");

    // Query the database for tasks with a specific priority
    dbRef.orderByChild('selectedValue').equalTo(priority).once('value', snapshot => {
        const tasks = snapshot.val();
        let filteredTasks = {}; // Initialize an empty object for filteredTasks

        if (tasks) {
            // Filter tasks by checking if keyword is included in either the task name or description, and if the task email matches
            filteredTasks = Object.keys(tasks).reduce((filtered, key) => {
              const task = tasks[key];
              // Check both the task name and description for the keyword, also ensure the email matches
              if ((task.task.toLowerCase().includes(keyword) || task.desc.toLowerCase().includes(keyword)) && task.email === email) {
                filtered[key] = task; // Add the task to filteredTasks if it matches criteria
              }
              return filtered;
            }, {});
        }

        // Display the filtered tasks
        displayfilteredtasks(filteredTasks);
    });
}


function displayfilteredtasks(filteredTasks) {
    const container = document.getElementById('filteredtasks');
   
    // Ensure the container is cleared before adding new content
    container.innerHTML = '';

    // Check if there are any tasks to display
    if (Object.keys(filteredTasks).length > 0) {
        Object.keys(filteredTasks).forEach(key => {
            const task = filteredTasks[key];
            // Use getPriorityColor to get the color based on task's priority
            const priorityColor = getPriorityColor(task.selectedValue);
            
            // Create elements for each task's description, priority (with color), and email, then append to the container
            const taskEl = document.createElement('div');
            taskEl.innerHTML = `<h3 style="display: inline-block;">${task.task}</h3>
                                <div class="priority-circle" style="background-color: ${priorityColor};"></div>
                                <p>Date: ${task.date}</p>
                                <p>Details: ${task.desc}</p>
                                <i class="fas fa-trash delete-icon" data-key="${key}" style="cursor:pointer;"></i>`;
            container.appendChild(taskEl);
        });
        
        // Attach delete event listeners after all tasks have been added to the DOM
        attachDeleteEventListeners();
    } else {
        // Display a message if no tasks match the search criteria
        container.innerHTML = '<p>No tasks found.</p>';
    }

}


document.addEventListener("DOMContentLoaded", function () {
    // Assuming you have the email variable set somewhere in your script
    const email = localStorage.getItem('email'); // Replace with your actual logic to get the email variable

    contactFormDB.orderByChild("email").equalTo(email).on("value", (snapshot) => {
        if (snapshot.exists()) {
            // Data exists, proceed to display
            displayData(snapshot.val());
        } else {
            // No data exists, handle accordingly (e.g., display a message)
            console.log("No data available for the specified email.");
        }
    }, (error) => {
        // Handle any errors that occurred while fetching data
        console.error("Error fetching data:", error);
    });
});


// Function to display data
function displayData(data) {
    const dataContainer = document.getElementById("fetchedDataContainer");
    dataContainer.innerHTML = ''; // Clear existing data

    Object.keys(data).forEach(key => {
        const entry = data[key];
        const priorityColor = getPriorityColor(entry.selectedValue);

        // Append a delete icon next to each item
        dataContainer.innerHTML += `<div>
            <h3 style="display: inline-block;">${entry.task}</h3>
            <div class="priority-circle" style="background-color: ${priorityColor};"></div>
            <p>Date: ${entry.date}</p>
            <p>Details: ${entry.desc}</p>
            <i class="fas fa-trash delete-icon" data-key="${key}" style="cursor:pointer;"></i>
        </div>`;
    });

    // Attach click event listeners to all delete icons
    attachDeleteEventListeners();
}




// Add this code to the end of your JavaScript script
$(document).ready(function () {
    // Event listener for the "View already made FlashCards" button
    $("#viewFlashCardsBtn").on("click", function () {
        // Redirect to flashcards.html
        window.location.href = "flashcards.html";
    });

});

function redirectToChatbot() {
    window.location.href = 'chatbot.html';
}

function redirectToGames() {
    window.location.href = 'game.html';
}

function redirectToAssignments() {
    window.location.href = 'Assignments.html';
}


// Function to get priority color based on selectedValue
function getPriorityColor(selectedValue) {
    switch (selectedValue) {
        case "Low":
            return "green";
        case "Medium":
            return "orange";
        case "High":
            return "red";
        default:
            return "transparent"; // Handle other cases or set a default color
    }
}

function deleteItem(key) {
    // Assuming you are deleting a task, adjust the reference for flashcards or other items as needed
    const itemRef = firebase.database().ref("task_form/" + key);
    itemRef.remove()
        .then(() => {
            console.log("Item successfully deleted");
            // Remove the item from the DOM
            document.querySelector(`[data-key="${key}"]`).parentElement.remove();
        })
        .catch((error) => {
            console.error("Error removing item: ", error);
        });
}


// Function to attach click event listeners to all bin icons
function attachDeleteEventListeners() {
    document.querySelectorAll('.delete-icon').forEach(item => {
        item.addEventListener('click', function() {
            const key = this.getAttribute('data-key');
            deleteItem(key);
        });
    });
}

$(document).ready(function() {
    // Prevent default form submission and call your submit function instead
    $("#task_form").on("submit", function(event) {
        event.preventDefault(); // Prevent the default form submission
        submitTask();
    });
});

