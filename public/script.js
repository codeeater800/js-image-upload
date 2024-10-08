document.getElementById("submitEmail").addEventListener("click", async () => {
  const emailInput = document.getElementById("email").value.trim();

  const response = await fetch(
    `/validate-email?email=${encodeURIComponent(emailInput)}`
  );
  const data = await response.json();

  if (data.success) {
    document.getElementById("emailError").style.display = "none";
    document.getElementById(
      "confirmName"
    ).textContent = `Hello ${data.name}, please upload your submission.`;
    document.getElementById("uploadSection").style.display = "block";
  } else {
    document.getElementById("emailError").style.display = "block";
    document.getElementById("uploadSection").style.display = "none";
  }
});

// File Upload with Drag and Drop
let dropArea = document.getElementById("drop-area");
let fileElem = document.getElementById("fileElem");

// Event listeners to prevent defaults on drag-and-drop actions
["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(eventName, preventDefaults, false);
});

// Highlight the drop area when a file is dragged over it
["dragenter", "dragover"].forEach((eventName) => {
  dropArea.addEventListener(
    eventName,
    () => dropArea.classList.add("highlight"),
    false
  );
});

// Remove highlight when dragging stops
["dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(
    eventName,
    () => dropArea.classList.remove("highlight"),
    false
  );
});

// Handle file drop
dropArea.addEventListener("drop", handleDrop, false);

// Open file browser when clicking on the drop area
dropArea.addEventListener("click", () => fileElem.click());

// Handle manual file selection
fileElem.addEventListener("change", (event) => {
  const files = event.target.files;
  handleFiles(files); // Handle the selected file from browsing
});

// Prevent default drag behaviors
function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

// Handle dropped files
function handleDrop(e) {
  let dt = e.dataTransfer;
  let files = dt.files;
  handleFiles(files); // Handle the dropped files
}

// Handle the files (both from drag-and-drop and manual browsing)
function handleFiles(files) {
  if (files.length > 0) {
    let file = files[0];
    if (file.size > 4 * 1024 * 1024) {
      alert("File size exceeds 4MB. Please upload a smaller image.");
      return;
    }

    // FileReader to show the preview
    let reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById("imagePreview").src = e.target.result;
      document.getElementById("preview").style.display = "block";
      document.getElementById("confirmUpload").style.display = "block";
    };
    reader.readAsDataURL(file); // Show preview of the selected file
  }
}

// Handle file upload on "Confirm Submission" click
document.getElementById("confirmUpload").addEventListener("click", async () => {
  const fileInput = document.getElementById("fileElem");

  if (!fileInput.files || fileInput.files.length === 0) {
    alert("Please select an image to upload.");
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  try {
    const response = await fetch("/upload", {
      method: "POST",
      body: formData,
    });

    // Check for success response
    const result = await response.json();
    if (result.success) {
      // Display the thank you message
      document.getElementById("thankYouMessage").style.display = "block";
      document.getElementById("uploadSection").style.display = "none";
    } else {
      alert("Failed to upload. Please try again.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("There was an issue with the upload. Please try again.");
  }
});
