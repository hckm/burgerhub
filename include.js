function loadInclude(file, id) {
  fetch(file)
    .then(r => r.text())
    .then(html => document.getElementById(id).innerHTML = html);
}

document.addEventListener("DOMContentLoaded", () => {
  loadInclude("header.html", "header");
  loadInclude("footer.html", "footer");
});
