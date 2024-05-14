const firebaseConfig = {
    apiKey: "AIzaSyDSFt3gENyg7ORoH7gUaetkxWMCY3jiqtE",
    authDomain: "loginsystem-183fb.firebaseapp.com",
    projectId: "loginsystem-183fb",
    storageBucket: "loginsystem-183fb.appspot.com",
    messagingSenderId: "783500832666",
    appId: "1:783500832666:web:e4b762ba55efdc20151423",
    measurementId: "G-1LHRWYLV0E",
    databaseURL: "https://loginsystem-183fb-default-rtdb.firebaseio.com",
};


firebase.initializeApp(firebaseConfig);


document.addEventListener('DOMContentLoaded', function() {

    RetrieveFiles();
});






function RetrieveFiles() {
  const storage = firebase.storage();
  const variable = localStorage.getItem('email');
  const listRef = storage.ref(`${variable}/`);

  const fetchedDataContainer = document.getElementById('fetchedDataContainer');
  fetchedDataContainer.innerHTML = '';
  fetchedDataContainer.classList.add('grid-layout');

  listRef.listAll()
    .then((res) => {
      res.items.forEach((itemRef) => {
        // Create a container for each file
        const fileContainer = document.createElement('div');
        fileContainer.classList.add('file-container'); // Add a class for styling

        // Create a clickable link for the file name
        const fileLink = document.createElement('a');
        fileLink.textContent = itemRef.name;
        fileLink.style.cursor = 'pointer'; // Make it look clickable

        // Generate a download URL for the file
        itemRef.getDownloadURL().then((url) => {
          fileLink.href = url;
          fileLink.download = itemRef.name; // Suggests a download filename. Works in some browsers.
          fileLink.target = '_blank'; // Optional: open in a new tab/window
        }).catch((error) => {
          console.error("Error getting file download URL:", error);
        });

       // Add delete icon using Font Awesome
       const deleteBtn = document.createElement('button');
       deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>'; // Using Font Awesome trash icon
       deleteBtn.onclick = function() {
         deleteFile(itemRef.fullPath);
       };

        // Create an icon element and append it if the file type matches
        let icon;
        if (itemRef.name.endsWith('.docx') || itemRef.name.endsWith('.doc')) {
          icon = 'images/worddoc.png'; // Path to Word document icon
        } else if (itemRef.name.endsWith('.pdf')) {
          icon = 'images/pdf.png'; // Path to PDF icon
        } else if (itemRef.name.endsWith('.png') || itemRef.name.endsWith('.jpg')|| itemRef.name.endsWith('.PNG')) {
          icon = 'images/image.png'; // Path to PDF icon
        } else if (itemRef.name.endsWith('.zip')) {
          icon = 'images/zip.png'; // Path to PDF icon
        } else if (itemRef.name.endsWith('.pptx') || itemRef.name.endsWith('.ppt')) {
          icon = 'images/powerpoint.png'; // Path to PDF icon
        }
        
        if (icon) {
          const fileIcon = document.createElement('img');
          fileIcon.src = icon;
          fileIcon.alt = 'File Icon';
          fileIcon.style.width = '128px'; // Set a fixed width for the icon
          fileContainer.appendChild(fileIcon); // Add the icon to the container
        }

        fileContainer.appendChild(fileLink); // Append the link below the icon
        fileContainer.appendChild(deleteBtn); // Append delete button
        fetchedDataContainer.appendChild(fileContainer); // Add the container to the grid
      });
    }).catch((error) => {
      console.log("Error listing files:", error);
    });
}



var storage = firebase.storage();


document.getElementById("uploadButton").addEventListener('click', () => {
    console.log("Cool");
    document.getElementById('fileInput').click();

});

document.getElementById('fileInput').addEventListener('change', (event) => {

    const file = event.target.files[0];
    if (file) {
        var variable = localStorage.getItem('email');
        console.log(variable); 
        var storageRef = firebase.storage().ref(`${variable}/${file.name}`);
        storageRef.put(file).then((snapshot) => {
            console.log('File uploaded successfully!');
        }).catch((error) => {
            console.error('Upload failed', error);
        });
    }
});


document.getElementById('fileInput').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
      var variable = localStorage.getItem('email');
      console.log(variable);
      var storageRef = firebase.storage().ref(`${variable}/${file.name}`);
      storageRef.put(file).then((snapshot) => {
          console.log('File uploaded successfully!');
          RetrieveFiles(); // Call RetrieveFiles again to update the list
      }).catch((error) => {
          console.error('Upload failed', error);
      });
  }
});




// Function to filter displayed files based on the search query
function filterFiles(searchQuery) {
  const fetchedDataContainer = document.getElementById('fetchedDataContainer');
  const fileContainers = fetchedDataContainer.getElementsByClassName('file-container');
  
  for (let i = 0; i < fileContainers.length; i++) {
      const fileLink = fileContainers[i].getElementsByTagName('a')[0];
      if (fileLink.textContent.toLowerCase().includes(searchQuery.toLowerCase())) {
          fileContainers[i].style.display = "";
      } else {
          fileContainers[i].style.display = "none";
      }
  }
}

// Function to delete a file
function deleteFile(filePath) {
  const storage = firebase.storage();
  const fileRef = storage.ref(filePath);

  fileRef.delete().then(() => {
    console.log('File deleted successfully');
    RetrieveFiles(); // Refresh the file list after deletion
  }).catch((error) => {
    console.error('Error deleting file:', error);
  });
}

// Event listener for the search input
document.getElementById('searchInput').addEventListener('input', function() {
  const searchQuery = this.value;
  filterFiles(searchQuery);
});

// Optional: Add event listener to the search button for additional search interaction, if needed
document.getElementById('searchButton').addEventListener('click', function() {
  const searchQuery = document.getElementById('searchInput').value;
  filterFiles(searchQuery);
});
