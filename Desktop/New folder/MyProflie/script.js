const currentPage = window.location.pathname.split("/").pop() || "index.html";
const navLinks = document.querySelectorAll(".nav a");

navLinks.forEach((link) => {
  const href = link.getAttribute("href");
  if (href === currentPage) {
    link.classList.add("active");
  }
});

const yearTarget = document.querySelector("[data-year]");
if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}
