// Scheduled Reminders
const twilio = require('twilio');
const firebase = require('firebase/compat/app');
require('firebase/compat/database');
const schedule = require('node-schedule'); // Import node-schedule

const twilio_number = 'YOUR_TWILIO_PHONE_NUMBER';
const accountSid = 'YOUR_TWILIO_ACCOUNT_SID';
const authToken = 'YOUR_TWILIO_AUTH_TOKEN';
const client = new twilio(accountSid, authToken);

const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
    projectId: "YOUR_FIREBASE_PROJECT_ID",
    storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
    messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
    appId: "YOUR_FIREBASE_APP_ID",
    measurementId: "YOUR_FIREBASE_MEASUREMENT_ID",
    databaseURL: "YOUR_FIREBASE_DATABASE_URL",
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const dbRef = firebase.database().ref();

async function fetchEmailsAndPhoneNumbers() {
    const emailToPhoneMap = new Map();
    const snapshot = await dbRef.child('phonenumber_form').once('value');
    snapshot.forEach(childSnapshot => {
        const { email, phoneNumber } = childSnapshot.val();
        if (email && phoneNumber) {
            emailToPhoneMap.set(email, phoneNumber);
        }
    });
    return emailToPhoneMap;
}

async function fetchTasksDueThisWeek(emailToPhoneMap) {
    const tasks = [];
    const now = new Date();
    let startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay() === 0 ? -6 : now.getDay() - 1), 0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const snapshot = await dbRef.child('task_form').once('value');

    snapshot.forEach(childSnapshot => {
        const task = childSnapshot.val();
        if (emailToPhoneMap.has(task.email)) {
            const taskDate = new Date(task.date);
            if (taskDate >= startOfWeek && taskDate < endOfWeek) {
                tasks.push({...task, phoneNumber: emailToPhoneMap.get(task.email)});
            }
        }
    });

    return tasks;
}

async function sendTaskReminder(tasks) {
    for (const task of tasks) {
        if (task.date && task.task && task.phoneNumber) {
            
            const dueDate = new Date(task.date).toLocaleDateString();
            const message = `Reminder: ${task.task} is due on ${dueDate}.`;
            console.log(message);
            // Remove the first digit and add +353 prefix
            const formattedPhoneNumber = '+353' + task.phoneNumber.substring(1);

            try {
                const messageResponse = await client.messages.create({
                    body: message,
                    to: formattedPhoneNumber, // Now using the formatted phone number
                    from: twilio_number // Replace with your actual Twilio number
                });
                console.log(`Message sent: ${messageResponse.sid}`);
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    }
}

async function sendTasksDueThisWeekNow() {
    console.log('Fetching emails and phone numbers...');
    const emailToPhoneMap = await fetchEmailsAndPhoneNumbers();

    console.log('Fetching and sending tasks due this week...');
    const tasks = await fetchTasksDueThisWeek(emailToPhoneMap);
    if (tasks.length > 0) {
        await sendTaskReminder(tasks);
    } else {
        console.log('No tasks due this week.');
    }
}

// Scheduling to run every tuesday 25 past 9
schedule.scheduleJob('27 9 * * 2', function() {
    console.log('Triggering task reminders for Monday at 9 AM...');
    sendTasksDueThisWeekNow().catch(console.error);
});

// Call the function for immediate execution
// sendTasksDueThisWeekNow().catch(console.error);

console.log('Service started.');



