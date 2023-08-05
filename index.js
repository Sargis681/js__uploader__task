const dropArea = document.querySelector(".container__cart");
const listSection = document.querySelector(".container__list-section");
const listContainer = document.querySelector(".container__list");
const fileSelector = document.querySelector(
  ".container__caltrap-file-selector"
);
const fileSelectorInput = document.querySelector(
  ".container__caltrap-file-selector-input"
);

let uploadEnyPoint = 0;
const files = [];
let unloading = true;
let a = 0
let container = []

fileSelector.onclick = () => fileSelectorInput.click();
fileSelectorInput.addEventListener("change", () => {
  const newFiles = [...fileSelectorInput.files];
  files.push(...newFiles);
  displayFiles();
  console.log(files);
  if (unloading) {
    unloading = false

    if (files.length - uploadEnyPoint >= 3) {
      console.log(files.length - uploadEnyPoint);
      uploadBatch(0, 3);
    } else {
      uploadBatch(0, files.length - uploadEnyPoint);
    }
  }

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
    if (files.length - uploadEnyPoint >= 3) {
      console.log(files.length - uploadEnyPoint);
      uploadBatch(0, 3);
    } else {
      uploadBatch(0, files.length - uploadEnyPoint);
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

  for (let i = uploadEnyPoint; i < files.length; i++) {
    const file = files[i];
    if (!listContainer.querySelector(`[data-name="${file.name}"]`)) {
      const li = document.createElement("li");
      li.classList.add("container__prog");
      li.innerHTML = `
        <div class="container__col"></div>
        <div class="container__col">
          <div class="container__file">
            <div class="container__name">${file.name}</div>
            <span >0</span>
            <span>%</span>
          </div>
          <div class="container__progress">
            <span></span>
          </div>
          <div class="file-size">${(file.size / (1024 * 1024)).toFixed(
        2
      )} MB</div>
        </div>
      `;
      li.setAttribute("data-name", file.name);
      listContainer.appendChild(li);
      container.push(li)
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



function uploadBatch(start, end) {

  for (let i = start; i < end; i++) {
    console.log(start, end);

    const xhr = new XMLHttpRequest();
    const data = new FormData();
    const serverEndpoint = "http://localhost:8080";

    data.append("file", files[i]);
    xhr.open("POST", serverEndpoint, true);
    const progress = container[i]
    console.log(container);
    const containerFile = progress.querySelector(".container__file span")
    const progressSpan = progress.querySelector(".container__progress span")
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percentComplete = ((e.loaded / e.total) * 100).toFixed(2);
        containerFile.innerHTML = percentComplete
        progressSpan.style.width = `${percentComplete}%`
      }
    };
    xhr.onload = () => {
      if (xhr.status === 200) {
        uploadEnyPoint++;
      }
      else {
        console.log('error');
      }
      a++
      if (uploadEnyPoint === files.length) {
        unloading = true
        a = 0
        container = []
        return
      }
      else if (a === end) {
        unloading = false
        uploadBatch(end, files.length - uploadEnyPoint >= 3 ? end + 3 : end + files.length - uploadEnyPoint)
      }
      else {
        unloading = false
      }
    }

    xhr.send(data);
  }

}
