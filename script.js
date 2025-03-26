function uploadFile() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (!file) {
        document.getElementById("message").innerText = "Please select a file!";
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    fetch("https://your-backend-url.com/upload", { // Replace with your API
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("message").innerText = "File uploaded successfully!";
        console.log("Response:", data);
    })
    .catch(error => {
        document.getElementById("message").innerText = "Error uploading file.";
        console.error("Error:", error);
    });
}
