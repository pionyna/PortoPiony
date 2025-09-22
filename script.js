const btnAbout = document.getElementById("btn-about");
const btnPorto = document.getElementById("btn-porto");
const content = document.getElementById("about");
const buttons = document.querySelectorAll(".tab-btn");

function setActive(button) {
  buttons.forEach((btn) => btn.classList.remove("active"));
  button.classList.add("active");
}

let lastHash = location.hash;
const OFFSET_ABOUT = 250;
const OFFSET_PORTO = 250;

function scrollWithOffsetSmooth(id, offset) {
  const el = document.querySelector(id);
  const y = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: y, behavior: "smooth" });
}

function scrollWithOffsetInstant(id, offset) {
  const el = document.querySelector(id);
  const y = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: y, behavior: "auto" });
}

let portoState = {
  history: ["porto"], // riwayat navigasi
  current: 0, // index sekarang
};

function updatePortoNav() {
  const left = document.getElementById("porto-left");
  const right = document.getElementById("porto-right");
  const breadcrumb = document.getElementById("porto-breadcrumb");

  // update breadcrumb text
  breadcrumb.textContent = portoState.history
    .slice(0, portoState.current + 1)
    .join(" > ");

  // left arrow aktif kalau bisa mundur
  if (portoState.current > 0) {
    left.classList.remove("disabled");
  } else {
    left.classList.add("disabled");
  }

  // right arrow aktif kalau bisa maju
  if (portoState.current < portoState.history.length - 1) {
    right.classList.remove("disabled");
  } else {
    right.classList.add("disabled");
  }
}

function attachLightbox() {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const closeBtn = document.querySelector(".lightbox .close");

  document.querySelectorAll(".gallery img").forEach((img) => {
    img.addEventListener("click", () => {
      lightbox.style.display = "flex";
      lightboxImg.src = img.src;
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      lightbox.style.display = "none";
    });
  }

  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) {
        lightbox.style.display = "none";
      }
    });
  }
}

function attachPortoHandlers() {
  const icons = content.querySelectorAll(".icon");
  const left = document.getElementById("porto-left");
  const right = document.getElementById("porto-right");

  const portoFiles = {
    "UI / UX Design": "porto-files/uiux.html",
    Project: "porto-files/project.html",
    "Graphics Design": "porto-files/graphics.html",
    "Logo Design": "porto-files/logo.html",
    "Product Design": "porto-files/product.html",
    "Character Art": "porto-files/character.html",
    "Element Game Design": "porto-files/element.html",
  };

  icons.forEach((icon) => {
    icon.style.cursor = "pointer";
    icon.addEventListener("click", () => {
      const filePath = icon.getAttribute("data-file");
      const label = icon.querySelector("p").textContent;

      if (!filePath) return;
      console.log("Mau load file:", filePath);

      fetch(filePath)
        .then((res) => {
          console.log("Status fetch:", res.status, filePath);
          return res.text();
        })
        .then((html) => {
          content.innerHTML = html;
          console.log("Berhasil load:", filePath);

          lastHash = "#porto";

          portoState.history = portoState.history.slice(
            0,
            portoState.current + 1
          );
          portoState.history.push(label);
          portoState.current++;

          updatePortoNav();

          // tombol kembali (opsional)
          const backBtn = content.querySelector("#back-to-porto");
          if (backBtn) {
            backBtn.addEventListener("click", () => {
              loadPorto(false);
            });
          }

          attachLightbox();
        })

        .catch((err) => {
          console.error("Gagal load file", filePath, err);
        });
    });
  });

  // === listener panah kiri ===
  if (left) {
    left.addEventListener("click", () => {
      if (portoState.current > 0) {
        portoState.current--;

        const label = content.querySelector("#porto-left");

        if (label === "porto") {
          // ✅ instant balik ke porto + reset
          label.addEventListener("click", () => {
            loadPorto(false);
          });
        } else {
          const filePath = portoFiles[label];
          if (filePath) {
            fetch(filePath)
              .then((res) => res.text())
              .then((html) => {
                content.innerHTML = html;
                updatePortoNav();
                attachPortoHandlers();
              });
          }
        }
      }
    });
  }

  if (right) {
    right.addEventListener("click", () => {
      if (portoState.current < portoState.history.length - 1) {
        portoState.current++;
        const label = portoState.history[portoState.current];

        if (label === "porto") {
          loadPorto(false);
        } else {
          const filePath = portoFiles[label];
          if (filePath) {
            fetch(filePath)
              .then((res) => res.text())
              .then((html) => {
                content.innerHTML = html;
                updatePortoNav();
                attachPortoHandlers();
              });
          }
        }
      }
    });
  }
}
function loadAbout(useSmooth = false, skipScroll = false) {
  fetch("about.html")
    .then((res) => res.text())
    .then((data) => {
      content.innerHTML = data;
      setActive(btnAbout);

      if (!skipScroll) {
        location.hash = "about"; // hanya ubah hash kalau memang mau scroll
        lastHash = "#about";

        setTimeout(() => {
          if (useSmooth) {
            scrollWithOffsetSmooth("#about", OFFSET_ABOUT);
          } else {
            scrollWithOffsetInstant("#about", OFFSET_ABOUT);
          }
        }, 50);
      } else {
        // kalau skipScroll true, tetap load about tapi hash & scroll tidak diubah
        lastHash = "#home";
      }
    });
}

function loadPorto(useSmooth = false) {
  fetch("porto.html")
    .then((res) => res.text())
    .then((data) => {
      content.innerHTML = data;
      setActive(btnPorto);
      location.hash = "porto";
      lastHash = "#porto";

      // ✅ reset state setiap kali balik ke porto
      portoState = {
        history: ["porto"],
        current: 0,
      };

      // panggil attachPortoHandlers setelah porto.html dimasukkan
      attachPortoHandlers();
      updatePortoNav();
      attachLightbox();

      setTimeout(() => {
        if (useSmooth) {
          scrollWithOffsetSmooth("#about", OFFSET_PORTO);
        } else {
          scrollWithOffsetInstant("#about", OFFSET_PORTO);
        }
      }, 50);
    });
}

// tombol bawah
btnAbout.addEventListener("click", () => {
  if (lastHash === "#porto") {
    loadAbout(false); // porto → about tanpa animasi
  } else {
    loadAbout(true); // dari home → about smooth
  }
});

btnPorto.addEventListener("click", () => {
  if (lastHash === "#about") {
    loadPorto(false); // about → porto tanpa animasi
  } else {
    loadPorto(true); // dari home → porto smooth
  }
});

// handle hash waktu reload
window.addEventListener("DOMContentLoaded", () => {
  if (location.hash === "#porto") {
    loadPorto(true); // home → porto smooth
  } else if (location.hash === "#about") {
    loadAbout(true); // home → about smooth
  } else {
    // default: tampil about, tapi scroll tetap di home
    loadAbout(false, true);
    document.querySelector("#home").scrollIntoView({ behavior: "auto" });
    lastHash = "#home";
  }
});

// navbar
fetch("nav.html")
  .then((res) => res.text())
  .then((data) => {
    document.getElementById("nav").innerHTML = data;

    const menuLinks = document.querySelectorAll(".menu a");

    menuLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();

        menuLinks.forEach((item) => item.classList.remove("active"));
        link.classList.add("active");

        const target = link.getAttribute("href").replace("#", "");

        if (target === "about") {
          if (lastHash === "#porto") {
            loadAbout(false);
          } else {
            loadAbout(true);
          }
        } else if (target === "porto") {
          if (lastHash === "#about") {
            loadPorto(false);
          } else {
            loadPorto(true);
          }
        } else if (target === "home") {
          document
            .querySelector("#home")
            .scrollIntoView({ behavior: "smooth" });
          lastHash = "#home";
        }
      });
    });
  });
