const dropArea = document.querySelector(".container__cart");
const listSection = document.querySelector(".container__list-section");
const listContainer = document.querySelector(".container__list");
const fileSelector = document.querySelector(
  ".container__caltrap-file-selector"
);
const fileSelectorInput = document.querySelector(
  ".container__caltrap-file-selector-input"
);
let files = [];
let isUploading = false;

fileSelector.onclick = () => fileSelectorInput.click();

fileSelectorInput.addEventListener("change", () => {
  const newFiles = [...fileSelectorInput.files];
  files.push(...newFiles);
  displayFiles();

  setTimeout(() => {
    if (!isUploading) {
      isUploading = true;
      uploadBatch(0);
    }
  }, 0);
});

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

  function addFilesAndStartUpload(newFiles) {
    files.push(...newFiles);
    displayFiles();
    if (!isUploading) {
      isUploading = true;
      uploadBatch(0);
    }
  }

  if (e.dataTransfer.items) {
    const newFiles = [...e.dataTransfer.files].filter((file) =>
      typeValidation(file.type)
    );
    addFilesAndStartUpload(newFiles);
  }
};

function displayFiles() {
  listSection.style.display = "block";
  const num = document.querySelectorAll(".container__prog").length;

  for (let i = num; i < files.length; i++) {
    const file = files[i];
    if (!listContainer.querySelector(`[data-name="${file.name}"]`)) {
      const li = document.createElement("li");
      li.classList.add("container__prog");
      li.innerHTML = `
        <div class="container__col"></div>
        <div class="container__col">
          <div class="container__file">
            <div class="container__name">${file.name}</div>
            <span>0%</span>
          </div>
          <div class="file-progress">
            <span></span>
          </div>
          <div class="file-size">${(file.size / (1024 * 1024)).toFixed(
            2
          )} MB</div>
        </div>
      `;
      li.setAttribute("data-name", file.name);
      listContainer.appendChild(li);
    }
  }
}

let currentBatch = 0;
const batchSize = 3;

function typeValidation(fileType) {
  return (
    fileType.startsWith("image/") ||
    fileType.startsWith("video/") ||
    fileType === "application/pdf"
  );
}

function uploadBatch(start) {
  let end = Math.min(start + batchSize, files.length);
  console.log(start, end);

  let batchFiles = files.slice(start, end);
  console.log("Batch", "of", Math.ceil(files.length / batchSize));

  if (batchFiles.length === 0) {
    console.log("All files uploaded!");
    files = [];
    isUploading = false;
    listContainer.innerHTML = "";
    return;
  }

  let completedCount = 0;

  batchFiles.forEach((file, i) => {
    console.log("bhjjhu");
    let li = listContainer.querySelector(`[data-name="${file.name}"]`);

    li.classList.add("container__prog");

    const xhr = new XMLHttpRequest();
    const data = new FormData();
    data.append("file", file);

    xhr.upload.onprogress = (e) => {
      const percentComplete = (e.loaded / e.total) * 100;
      li.querySelector(".container__file span").innerHTML =
        Math.round(percentComplete) + "%";
      li.querySelector(".file-progress span").style.width =
        percentComplete + "%";
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        li.classList.add("container__complete");
        console.log(completedCount);
        completedCount++;

        if (completedCount === batchFiles.length) {
          isUploading = false;
          currentBatch++;
          uploadBatch(end);
        }
      }
    };

    xhr.onerror = () => {
      console.log("An error occurred during file upload.");
    };

    const serverEndpoint = "http://localhost:8080"; // Replace with your server endpoint
    xhr.open("POST", serverEndpoint, true);
    xhr.send(data);
  });
}
