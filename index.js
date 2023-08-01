const dropArea = document.querySelector(".container__cart");
const listSection = document.querySelector(".container__list-section");
const listContainer = document.querySelector(".container__list");
const fileSelector = document.querySelector(
  ".container__caltrap-file-selector"
);
const fileSelectorInput = document.querySelector(
  ".container__caltrap-file-selector-input"
);
let f = 0;
const files = [];
unloading = true;

fileSelector.onclick = () => fileSelectorInput.click();
fileSelectorInput.addEventListener("change", () => {
  const newFiles = [...fileSelectorInput.files];
  files.push(...newFiles);
  displayFiles();
  if (unloading) {
    [a, b] = uploadBatch(a, b);
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
    [a, b] = uploadBatch(a, b);
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

function typeValidation(fileType) {
  return (
    fileType.startsWith("image/") ||
    fileType.startsWith("video/") ||
    fileType === "application/pdf"
  );
}

let a = 0;
let b = 3;

function uploadBatch(startIndex, endIndex) {
  console.log(endIndex);
  console.log("bhjjhu");
  unloading = false;

  for (let i = startIndex; i < endIndex; i++) {
    let li = listContainer.querySelector(
      `[data-name="${files[i] && files[i].name}"]`
    );
    if (!files[i]) {
      unloading = true;
      return;
    }
    const xhr = new XMLHttpRequest();
    const data = new FormData();
    data.append("file", files[i]);
    xhr.upload.onprogress = (e) => {
      const percentComplete = (e.loaded / e.total) * 100;
      li.querySelector(".container__file span").innerHTML =
        Math.round(percentComplete) + "%";
      li.querySelector(".file-progress span").style.width =
        percentComplete + "%";
    };

    xhr.onload = () => {
      li.classList.add("container__complete");
      f++;
      if (f % 3 === 0) {
        a = endIndex;
        b = endIndex + 3;
        console.log(a + " popoxvat a");
        console.log(b + " popoxvat b");
        [a, b] = uploadBatch(a, b);
        if (f === files.length) unloading = true;
      }
    };

    xhr.onerror = () => {
      console.log("An error occurred during file upload.");
    };

    const serverEndpoint = "http://localhost:8080";
    xhr.open("POST", serverEndpoint, true);
    xhr.send(data);
  }

  return [a, b];
}
