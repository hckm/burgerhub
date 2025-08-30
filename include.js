function includeHTML(file, elementId) {
  fetch(file)
    .then(response => response.text())
    .then(data => {
      document.getElementById(elementId).innerHTML = data;
    });
}

// Quando a página carrega, ele puxa os includes
document.addEventListener("DOMContentLoaded", () => {
  includeHTML("header.html", "site-header");
  includeHTML("footer.html", "site-footer");
});
