const dropArea = document.querySelector(".container__cart");
const listSection = document.querySelector(".container__list-section");
const listContainer = document.querySelector(".container__list");
const fileSelector = document.querySelector(
  ".container__caltrap-file-selector"
);
const fileSelectorInput = document.querySelector(
  ".container__caltrap-file-selector-input"
);

let allUploads = 0;

const files = [];
let isUnLoading = true;
let fileToDrag = 0;
let container = [];
let startIndex = 0;
let endIndex = 3;

function retrievalMethod(newFiles) {
  files.push(...newFiles);
  displayFiles();
  if (isUnLoading) {
    isUnLoading = false;

    if (files.length - allUploads >= endIndex) {
      uploadBatch(startIndex, endIndex);
    } else {
      uploadBatch(startIndex, files.length - allUploads);
    }
  }
}

fileSelector.onclick = () => fileSelectorInput.click();
fileSelectorInput.addEventListener("change", () => {
  const newFiles = [...fileSelectorInput.files].filter((file) =>
    typeValidation(file.type)
  );
  retrievalMethod(newFiles);
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
  if (e.dataTransfer.items) {
    const newFiles = [...e.dataTransfer.files].filter((file) =>
      typeValidation(file.type)
    );
    retrievalMethod(newFiles);
  }
};

function displayFiles() {
  listSection.style.display = "block";

  for (let i = allUploads; i < files.length; i++) {
    const file = files[i];
    if (!listContainer.querySelector(`[data-name="${file.name}"]`)) {
      const li = document.createElement("li");
      li.classList.add("container__prog");
      let containerCol1 = document.createElement("div");
      containerCol1.className = "container__col";

      let containerCol2 = document.createElement("div");
      containerCol2.className = "container__col";

      let containerFile = document.createElement("div");
      containerFile.className = "container__file";

      let containerName = document.createElement("div");
      containerName.className = "container__name";
      containerName.textContent = file.name;

      let span1 = document.createElement("span");
      span1.textContent = "0";
      let span2 = document.createElement("span");
      span2.textContent = "%";

      containerFile.appendChild(containerName);
      containerFile.appendChild(span1);
      containerFile.appendChild(span2);

      let containerProgress = document.createElement("div");
      containerProgress.className = "container__progress";

      let progressSpan = document.createElement("span");
      containerProgress.appendChild(progressSpan);

      let fileSize = document.createElement("div");
      fileSize.className = "file-size";
      fileSize.textContent = (file.size / (1024 * 1024)).toFixed(2) + " MB";

      containerCol2.appendChild(containerFile);
      containerCol2.appendChild(containerProgress);
      containerCol2.appendChild(fileSize);

      li.appendChild(containerCol1);
      li.appendChild(containerCol2);

      li.setAttribute("data-name", file.name);
      listContainer.appendChild(li);
      container.push(li);
    }
  }
}

function typeValidation(fileType) {
  return (
    fileType.startsWith("image/") ||
    fileType.startsWith("video/") ||
    fileType === "application/pdf"
  );
}
function handleProgress(e, containerFile, progressSpan) {
  if (e.lengthComputable) {
    const percentComplete = ((e.loaded / e.total) * 100).toFixed(2);
    containerFile.innerHTML = percentComplete;
    progressSpan.style.width = `${percentComplete}%`;
  }
}

function handlerOnload(end, xhr) {
  if (xhr.status === 200) {
    allUploads++;
  }
  fileToDrag++;

  if (allUploads === files.length) {
    isUnLoading = true;
    fileToDrag = 0;
    container = [];
    return;
  } else if (fileToDrag === end) {
    isUnLoading = false;
    uploadBatch(end, end + Math.min(endIndex, files.length - allUploads));
  }
}

function uploadBatch(start, end) {
  for (let i = start; i < end; i++) {
    const xhr = new XMLHttpRequest();
    const data = new FormData();
    const serverEndpoint = "http://localhost:8080";

    data.append("file", files[i]);
    xhr.open("POST", serverEndpoint, true);
    const progress = container[i];
    const containerFile = progress.querySelector(".container__file span");
    const progressSpan = progress.querySelector(".container__progress span");

    xhr.upload.onprogress = (e) =>
      handleProgress(e, containerFile, progressSpan);

    xhr.onload = () => handlerOnload(end, xhr);

    xhr.send(data);
  }
}
