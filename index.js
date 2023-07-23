const dropArea = document.querySelector(".container__cart");
const listSection = document.querySelector(".container__list-section");
const listContainer = document.querySelector(".container__list");
const fileSelector = document.querySelector(".container__coldrap-file-selector");
const fileSelectorInput = document.querySelector(".container__coldrap-file-selector-input");
let a = 0;
let files = [];
let uploadedFiles = [];
let isUploading = false;

fileSelector.onclick = () => fileSelectorInput.click();

fileSelectorInput.onchange = () => {
  a +=1 

    const newFiles = [...fileSelectorInput.files];
    addFilesAndStartUpload(newFiles);
};
function fuTwo(newFiles) {
  files = [...newFiles]
  displayFiles();
  
}

dropArea.ondragover = (e) => {
  e.preventDefault();
  dropArea.classList.add("drag-over-effect");
};

dropArea.ondragleave = () => {
  dropArea.classList.remove("drag-over-effect");
};

dropArea.ondragenter = (e) => {
  e.preventDefault();
  dropArea.classList.add("drag-over-effect");
};

dropArea.ondragend = () => {
  dropArea.classList.remove("drag-over-effect");
};

dropArea.ondrop = (e) => {
  e.preventDefault();
  dropArea.classList.remove("drag-over-effect");

  if (e.dataTransfer.items) {
    const newFiles = [...e.dataTransfer.files].filter((file) => typeValidation(file.type));
    addFilesAndStartUpload(newFiles);
  }
};

function displayFiles() {
  listSection.style.display = "block";

  files.forEach((file) => {
    if (!uploadedFiles.includes(file)) {
      const li = document.createElement("li");
      li.classList.add("in-prog");
      li.innerHTML = `
        <div class="col"></div>
        <div class="col">
          <div class="file-name">
            <div class="name">${file.name}</div>
            <span>0%</span>
          </div>
          <div class="file-progress">
            <span></span>
          </div>
          <div class="file-size">${(file.size / (1024 * 1024)).toFixed(2)} MB</div>
        </div>
       
      `;
      listContainer.appendChild(li);
    }
  });
}

function addFilesAndStartUpload(newFiles) {
  files = [...newFiles]
  displayFiles();

  if (!isUploading) {
    uploadFilesInBatches();
  }
}


function uploadFilesInBatches() {
  isUploading = true;
  const batchSize = 3;
  const totalBatches = Math.ceil(files.length / batchSize);

  let currentBatch = 0;

  function uploadBatch() {
    const start = currentBatch * batchSize;
    const end = Math.min(start + batchSize);
    const batchFiles = files.slice(start, end);
    console.log("Batch", currentBatch + 1, "of", totalBatches);

    if (batchFiles.length === 0) {
      console.log("All files uploaded successfully.");

      isUploading = false;
      return;
    }

    let completedCount = 0;
    let hasError = false;

    batchFiles.forEach((file, i) => {
      if (!uploadedFiles.includes(file)) {
        let li;
        const fileElements = listContainer.getElementsByClassName("name");
        for (let i = 0; i < fileElements.length; i++) {
          if (fileElements[i].textContent === file.name) {
            li = fileElements[i].closest("li");
            break;
          }
        }

     

        li.classList.add("in-prog");

        const xhr = new XMLHttpRequest();
        const data = new FormData();
        data.append("file", file);

        xhr.upload.onprogress = (e) => {
          const percentComplete = (e.loaded / e.total) * 100;
          li.querySelector(".file-name span").innerHTML = Math.round(percentComplete) + "%";
          li.querySelector(".file-progress span").style.width = percentComplete + "%";
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            li.classList.add("complete");
            console.log(completedCount);
            completedCount++;
            uploadedFiles.push(file);

            if (completedCount === batchFiles.length) {
              if (a > 1) {
                uploadBatch(); 
              }
              currentBatch++;
              uploadBatch(); 
            }
          }
        };

        xhr.onerror = () => {
          console.log("An error occurred during file upload.");
          hasError = true;
        };

        const serverEndpoint = "http://localhost:8080"; 
        xhr.open("POST", serverEndpoint, true);

        xhr.send(data);
      }
    });
  }

  uploadBatch();
}



function typeValidation(fileType) {
  return fileType.startsWith("image/") || fileType.startsWith("video/") || fileType === "application/pdf";
}
