// file2.js


import { firebaseConfig } from './firebaseConfig.js';


if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app(); // if already initialized, use that one
}






// $(document).ready(function() {
//     var calendarEl = document.getElementById('calendar');
  
//     $('#calendarModal').on('shown.bs.modal', function () {
//         var calendar = new FullCalendar.Calendar(calendarEl, {
//             initialView: 'dayGridMonth',
//             events: [
//                 // Example event object
//                 { title: 'Event 1', start: '2024-03-01' },
//                 { title: 'Event 2', start: '2024-03-01' },
//                 // Add more events as needed
//             ]
//             // Other FullCalendar options...
//         });
//         calendar.render();
//     });
// });

$(document).ready(function() {
    var calendarEl = document.getElementById('calendar');

    $('#calendarModal').on('shown.bs.modal', function () {
        const userEmail = localStorage.getItem('email'); // Assume this is how you get the user email

        var tasksRef = firebase.database().ref('task_form');

        tasksRef.orderByChild('email').equalTo(userEmail).once('value', snapshot => {
            const tasks = snapshot.val();
            const events = [];

            // Convert tasks to FullCalendar events
            for (let taskId in tasks) {
                const task = tasks[taskId];
                let eventColor = '#378006'; // Default color for undefined priority

                // Assign color based on task priority
                switch (task.selectedValue) {
                    case 'Low':
                        eventColor = 'green';
                        break;
                    case 'Medium':
                        eventColor = 'orange';
                        break;
                    case 'High':
                        eventColor = 'red';
                        break;
                }

                events.push({
                    title: task.task, // Assuming there's a 'task' field for the title
                    start: task.date, // Assuming there's a 'date' field for the start date
                    backgroundColor: eventColor, // Color depends on priority
                    borderColor: eventColor // To match the border with the background
                });
            }

            // Now that we have our events, initialize the calendar
            var calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                events: events, // Use the fetched events
                // Other FullCalendar options...
            });
            calendar.render();
        }).catch(error => {
            console.error("Failed to fetch tasks:", error);
        });
    });
});
