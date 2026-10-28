document.addEventListener("DOMContentLoaded", () => {

  /* =========================================================
     SELECTORS
  ========================================================= */

  const navbar =
    document.getElementById("navbar");

  const navLinks =
    document.querySelector(".nav__links");

  const menuToggle =
    document.getElementById("menuToggle");

  const dropdowns =
    document.querySelectorAll(".nav__dropdown");

  /* Meniul mobil este prezentat ca un cuprins al monografiei. */
  if (navLinks && !navLinks.querySelector(".mobile-nav__intro")) {
    const intro = document.createElement("div");
    intro.className = "mobile-nav__intro";
    intro.innerHTML = `
      <span class="mobile-nav__eyebrow">Monografia comunei</span>
      <strong>Cuprins</strong>
      <small>Alege un capitol pentru a continua explorarea</small>
    `;
    navLinks.prepend(intro);

    dropdowns.forEach((dropdown, index) => {
      dropdown.style.setProperty("--nav-index", `'${String(index + 1).padStart(2, "0")}'`);
      dropdown.querySelector(".dropdown-trigger")?.setAttribute("aria-expanded", "false");
    });

    const footer = document.createElement("div");
    footer.className = "mobile-nav__footer";
    footer.innerHTML = '<i class="fas fa-location-dot"></i><span>Bustuchin, Gorj<br><small>Istorie · oameni · locuri</small></span>';
    navLinks.append(footer);
  }



  /* =========================================================
     MOBILE MENU
  ========================================================= */

  if(menuToggle && navLinks){

    menuToggle.addEventListener("click", () => {

      navLinks.classList.toggle("active");

      menuToggle.classList.toggle("active");

      document.body.classList.toggle("menu-open");

      const isOpen = navLinks.classList.contains("active");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Închide meniul" : "Deschide meniul");

    });

  }



  /* =========================================================
     CLOSE MENU WHEN CLICK OUTSIDE
  ========================================================= */

  document.addEventListener("click", (e) => {

    if(
      navLinks &&
      menuToggle &&
      !navLinks.contains(e.target) &&
      !menuToggle.contains(e.target)
    ){

      navLinks.classList.remove("active");

      menuToggle.classList.remove("active");

      document.body.classList.remove("menu-open");

      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Deschide meniul");



      /* CLOSE DROPDOWNS */

      dropdowns.forEach(dropdown => {

        dropdown.classList.remove("active");

      });

    }

  });


/* =========================================================
   CLOSE MOBILE MENU WHEN CLICK NAV LINK
========================================================= */

document
  .querySelectorAll(".nav__dropdown-menu a, .nav__links > a")
  .forEach(link => {

    link.addEventListener("click", () => {

      /* Închide meniul dacă acesta este deschis */

      if(navLinks && navLinks.classList.contains("active")){

        navLinks.classList.remove("active");

        menuToggle?.classList.remove("active");

        document.body.classList.remove("menu-open");

        menuToggle?.setAttribute("aria-expanded", "false");
        menuToggle?.setAttribute("aria-label", "Deschide meniul");

      }


      /* Închide toate dropdown-urile */

      dropdowns.forEach(dropdown => {

        dropdown.classList.remove("active");

      });

    });

  });


  /* =========================================================
     TOUCH DEVICE DROPDOWN
  ========================================================= */

dropdowns.forEach(dropdown => {

  const trigger =
    dropdown.querySelector(".dropdown-trigger");

  if(!trigger) return;

  trigger.addEventListener("click", (e) => {

    e.preventDefault();

    dropdowns.forEach(item => {

      if(item !== dropdown){

        item.classList.remove("active");

      }

    });

    dropdown.classList.toggle("active");

    dropdowns.forEach(item => {
      item.querySelector(".dropdown-trigger")?.setAttribute(
        "aria-expanded",
        String(item.classList.contains("active"))
      );
    });

  });

});


  /* =========================================================
     NAVBAR SCROLL EFFECT
  ========================================================= */

  window.addEventListener("scroll", () => {

    if(!navbar) return;

    if(window.scrollY > 50){

      navbar.classList.add("scrolled");

    }else{

      navbar.classList.remove("scrolled");

    }

  });



  /* =========================================================
     NAVIGARE INTERNĂ UNIFICATĂ
     Toate linkurile cu #id se opresc exact sub navbar și
     folosesc tranziția editorială „Descoperă Bustuchin”.
  ========================================================= */

  const closeNavigationMenu = () => {
    navLinks?.classList.remove("active");
    menuToggle?.classList.remove("active");
    document.body.classList.remove("menu-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Deschide meniul");
    dropdowns.forEach(dropdown => {
      dropdown.classList.remove("active");
      dropdown.querySelector(".dropdown-trigger")?.setAttribute("aria-expanded", "false");
    });
  };

  const getFixedNavigationOffset = () => {
    if (window.bustuchinReadingOffset) return Math.ceil(window.bustuchinReadingOffset());
    if (!navbar) return 18;
    const navbarStyle = getComputedStyle(navbar);
    const navbarHeight = navbar.getBoundingClientRect().height || 62;
    const navbarTop = Number.parseFloat(navbarStyle.top) || 0;
    return Math.ceil(navbarHeight + navbarTop + 16);
  };

  const navigateBustuchinToHash = (hash, options = {}) => {
    if (!hash || hash === "#") return false;
    const id = decodeURIComponent(hash.replace(/^#/, ""));
    const target = document.getElementById(id);
    if (!target) return false;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const transition = document.getElementById("pageTransition");
    const shouldTransition = options.transition !== false;
    const transitionDuration = reducedMotion ? 320 : 700;

    closeNavigationMenu();
    if (window.location.hash !== hash) history.pushState(null, "", hash);

    if (shouldTransition) {
      transition?.classList.add("active");
      transition?.setAttribute("aria-hidden", "false");
    }

    const placeTargetExactly = () => {
      const destination = Math.max(
        0,
        target.getBoundingClientRect().top + window.scrollY - getFixedNavigationOffset()
      );
      window.scrollTo({ top: destination, behavior: "instant" });
      window.dispatchEvent(new Event("scroll"));
    };

    /* Scrollul are loc sub tranziție, nu în fața vizitatorului. */
    window.setTimeout(placeTargetExactly, shouldTransition ? 150 : 0);

    /* Corecție pentru navbarul fix și barele dinamice ale browserelor mobile. */
    window.setTimeout(() => {
      const expectedTop = getFixedNavigationOffset();
      const error = target.getBoundingClientRect().top - expectedTop;
      if (Math.abs(error) > 2) window.scrollBy({ top: error, behavior: "instant" });
      window.dispatchEvent(new Event("scroll"));
    }, shouldTransition ? 250 : 80);

    if (shouldTransition) {
      window.setTimeout(() => {
        transition?.classList.remove("active");
        transition?.setAttribute("aria-hidden", "true");
      }, transitionDuration);
    }
    return true;
  };

  window.navigateBustuchinToHash = navigateBustuchinToHash;

  document.addEventListener("click", event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || link.hasAttribute("data-native-anchor")) return;
    const hash = link.getAttribute("href");
    if (!hash || hash === "#" || !navigateBustuchinToHash(hash)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);


/* =========================================================
   HERO VIDEO
========================================================= */

const heroSection =
  document.getElementById("hero");

const playVideoBtn =
  document.getElementById("playVideoBtn");

const heroVideo =
  document.getElementById("heroVideo");

const heroIframe =
  document.getElementById("heroIframe");

const closeHeroVideo =
  document.getElementById("closeHeroVideo");


/* =========================================================
   YOUTUBE VIDEO
========================================================= */

const heroYoutubeVideoId =
  "_gEYWhsmpBc";


/* =========================================================
   PLAY HERO VIDEO
========================================================= */

function playHeroVideo() {

  if (
    !heroSection ||
    !heroVideo ||
    !heroIframe
  ) {
    return;
  }


  heroIframe.src =
    `https://www.youtube.com/embed/${heroYoutubeVideoId}?autoplay=1&controls=1&rel=0&modestbranding=1&playsinline=1`;


  heroSection.classList.add(
    "is-video-playing"
  );


  heroVideo.setAttribute(
    "aria-hidden",
    "false"
  );

}


/* =========================================================
   STOP HERO VIDEO
========================================================= */

function stopHeroVideo() {

  if (
    !heroSection ||
    !heroVideo ||
    !heroIframe
  ) {
    return;
  }


  heroSection.classList.remove(
    "is-video-playing"
  );


  heroVideo.setAttribute(
    "aria-hidden",
    "true"
  );


  /*
    Golirea src-ului oprește efectiv
    redarea videoclipului YouTube.
  */

  heroIframe.src =
    "";

}


/* =========================================================
   PLAY BUTTON
========================================================= */

if (playVideoBtn) {

  playVideoBtn.addEventListener(
    "click",
    playHeroVideo
  );

}

if (closeHeroVideo) {
  closeHeroVideo.addEventListener("click", stopHeroVideo);
}

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && heroSection?.classList.contains("is-video-playing")) {
    stopHeroVideo();
    playVideoBtn?.focus();
  }
});

/* =========================================================
   AUTO STOP HERO VIDEO ON SCROLL
========================================================= */

if (
  heroSection &&
  heroVideo
) {

  const heroObserver =
    new IntersectionObserver(

      (entries) => {

        entries.forEach((entry) => {

          if (
            entry.intersectionRatio < 0.15 &&
            heroSection.classList.contains(
              "is-video-playing"
            )
          ) {

            stopHeroVideo();

          }

        });

      },

      {
        threshold: [
          0,
          0.15,
          1
        ]
      }

    );


  heroObserver.observe(
    heroSection
  );

}


/* =========================================================
   STOP VIDEO WHEN PAGE IS HIDDEN
========================================================= */

document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.hidden &&
      heroSection?.classList.contains(
        "is-video-playing"
      )
    ) {

      stopHeroVideo();

    }

  }
);

});

/* =========================================================
   REVEAL ON SCROLL
========================================================= */

const reveals =
  document.querySelectorAll(
    ".reveal, .history-card"
  );


const revealObserver =
  new IntersectionObserver(

    (entries, observer) => {

      entries.forEach((entry) => {

        if (!entry.isIntersecting) {
          return;
        }


        entry.target.classList.add(
          "active"
        );


        observer.unobserve(
          entry.target
        );

      });

    },

    {
      threshold: 0.15
    }

  );


reveals.forEach((reveal) => {

  revealObserver.observe(
    reveal
  );

});



/* =========================================================
   AUTOMATIC HISTORY YEARS
========================================================= */

const historyYears =
  document.getElementById("historyYears");

if(historyYears){

  const startYear =
    Number(historyYears.dataset.startYear);

  const currentYear =
    new Date().getFullYear();

  const yearsOfHistory =
    currentYear - startYear;

  historyYears.dataset.target =
    yearsOfHistory;

}

/* =========================================================
   STATS COUNTER
========================================================= */

const statNumbers =
  document.querySelectorAll(".stats__number[data-target]")



const animateStat = (stat) => {

  const target =
    +stat.dataset.target;

  let current = 0;

  const increment =
    target / 80;



  stat.textContent = 0;



  const updateCounter = () => {

    current += increment;



    if(current < target){

      stat.textContent =
        Math.floor(current);

      requestAnimationFrame(updateCounter);

    }else{

      stat.textContent = target;

    }

  };



  updateCounter();

};



const statsObserver =
  new IntersectionObserver((entries) => {

    entries.forEach(entry => {

      if(entry.isIntersecting){

        const stat =
          entry.target;



        /* PREVENT MULTIPLE TRIGGERS */

        if(stat.classList.contains("counting"))
          return;



        stat.classList.add("counting");



        animateStat(stat);



        /* RESET AFTER ANIMATION */

        setTimeout(() => {

          stat.classList.remove("counting");

        }, 1000);

      }

    });

  },{
    threshold:0.45
  });



statNumbers.forEach(stat => {

  statsObserver.observe(stat);

});


















/* =========================================================
   WELCOME SIGN - ANIMATE ON VIEW
========================================================= */

const welcomeSign =
  document.querySelector(".section-kicker-top");

if(welcomeSign){

  const welcomeObserver =
    new IntersectionObserver((entries, observer) => {

      entries.forEach(entry => {

        if(entry.isIntersecting){

          entry.target.classList.add("is-visible");

          /* Rulează o singură dată */
          observer.unobserve(entry.target);

        }

      });

    },{
      threshold:0.45
    });

  welcomeObserver.observe(welcomeSign);

}

/* =========================================================
   HARTA INTERACTIVĂ — COMUNA BUSTUCHIN
========================================================= */

/* =========================================================
   PAGE SCROLL PROGRESS
========================================================= */

function initScrollProgress() {

  const progressBar =
    document.getElementById(
      "scrollProgressBar"
    );


  if (!progressBar) {
    return;
  }


  let ticking =
    false;


  function updateProgress() {

    /* =====================================================
       DISTANȚA TOTALĂ CARE POATE FI PARCURSĂ
    ===================================================== */

    const scrollableHeight =
      document.documentElement.scrollHeight
      - window.innerHeight;


    /* =====================================================
       PROCENT SCROLL
    ===================================================== */

    let progress =
      scrollableHeight > 0
        ? (
            window.scrollY /
            scrollableHeight
          ) * 100
        : 0;


    /* Siguranță */

    progress =
      Math.min(
        Math.max(
          progress,
          0
        ),
        100
      );


    /* =====================================================
       ACTUALIZEAZĂ BARA
    ===================================================== */

    progressBar.style.width =
      `${progress}%`;


    ticking =
      false;

  }


  /* =======================================================
     SCROLL
  ======================================================= */

  window.addEventListener(
    "scroll",
    () => {

      if (ticking) {
        return;
      }


      window.requestAnimationFrame(
        updateProgress
      );


      ticking =
        true;

    },
    {
      passive:
        true
    }
  );


  /* =======================================================
     RESIZE
  ======================================================= */

  window.addEventListener(
    "resize",
    updateProgress
  );


  /* =======================================================
     POZIȚIA INIȚIALĂ
  ======================================================= */

  updateProgress();

}


/* =========================================================
   PORNIRE
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  initScrollProgress
);







/* =========================================================
   NAVBAR — CAPITOL ACTIV ÎN FUNCȚIE DE SCROLL
========================================================= */

function initActiveNavSection() {

  /* =======================================================
     DEFINIRE CAPITOLE

     "selector" = zona din pagină
     "navText"  = textul dropdown-ului din navbar
  ======================================================= */

  const chapters = [

    /* EVENIMENTE */

    {
      selector:
        "#evenimente",

      navText:
        "Evenimente"
    },


    /* SATE */

    {
      selector:
        "#sate",

      navText:
        "Sate"
    },


    /* CULTURĂ */

    {
      selector:
        "#patrimoniu",

      navText:
        "Cultura"
    },


    /* ISTORIE */

    {
      selector:
        "#istorie",

      navText:
        "Istorie"
    },


    /* GEOGRAFIE */

    {
      selector:
        "#geografie",

      navText:
        "Geografie"
    },


    /* TURISM */

    {
      selector:
        "#turism",

      navText:
        "Turism"
    },


    /* INFRASTRUCTURĂ */

    {
      selector:
        "#infrastructura",

      directHref:
        "#infrastructura"
    },


    /* EDUCAȚIE */

    {
      selector:
        "#educatie",

      navText:
        "Educație"
    },

    /*Religie*/
    {
      selector:
      "#religie",
      navText:
      "Religie"
    }

  ];


  /* =======================================================
     GĂSEȘTE ELEMENTELE NAVBAR
  ======================================================= */

  const dropdowns =
    document.querySelectorAll(
      ".nav__dropdown"
    );


  const directLinks =
    document.querySelectorAll(
      ".nav__links > a"
    );


  /* =======================================================
     ȘTERGE ACTIVE STATE
  ======================================================= */

  function clearCurrentNav() {

    dropdowns.forEach(
      dropdown => {

        dropdown.classList.remove(
          "current-section"
        );

      }
    );


    directLinks.forEach(
      link => {

        link.classList.remove(
          "current-section"
        );

      }
    );

  }


  /* =======================================================
     ACTIVEAZĂ DROPDOWN DUPĂ TEXT
  ======================================================= */

  function activateDropdown(
    navText
  ) {

    dropdowns.forEach(
      dropdown => {

        const trigger =
          dropdown.querySelector(
            ".dropdown-trigger"
          );


        if (!trigger) {
          return;
        }


        const text =
          trigger.textContent
            .replace(/\s+/g, " ")
            .trim();


        if (
          text
            .toLowerCase()
            .includes(
              navText.toLowerCase()
            )
        ) {

          dropdown.classList.add(
            "current-section"
          );

        }

      }
    );

  }


  /* =======================================================
     ACTIVEAZĂ LINK DIRECT
  ======================================================= */

  function activateDirectLink(
    href
  ) {

    const link =
      document.querySelector(
        `.nav__links > a[href="${href}"]`
      );


    if (link) {

      link.classList.add(
        "current-section"
      );

    }

  }


  /* =======================================================
     GĂSEȘTE CAPITOLUL CURENT
  ======================================================= */

  function updateActiveChapter() {

    const viewportPoint =
      window.scrollY
      + window.innerHeight * 0.32;


    let currentChapter =
      null;


    chapters.forEach(
      chapter => {

        const section =
          document.querySelector(
            chapter.selector
          );


        if (!section) {
          return;
        }


        const top =
          section.offsetTop;


        const bottom =
          top
          + section.offsetHeight;


        if (
          viewportPoint >= top &&
          viewportPoint < bottom
        ) {

          currentChapter =
            chapter;

        }

      }
    );


    clearCurrentNav();


    if (!currentChapter) {
      return;
    }


    if (
      currentChapter.navText
    ) {

      activateDropdown(
        currentChapter.navText
      );

    }


    if (
      currentChapter.directHref
    ) {

      activateDirectLink(
        currentChapter.directHref
      );

    }

  }


  /* =======================================================
     SCROLL OPTIMIZAT
  ======================================================= */

  let ticking =
    false;


  window.addEventListener(
    "scroll",
    () => {

      if (ticking) {
        return;
      }


      requestAnimationFrame(
        () => {

          updateActiveChapter();

          ticking =
            false;

        }
      );


      ticking =
        true;

    },
    {
      passive:
        true
    }
  );


  /* RESIZE */

  window.addEventListener(
    "resize",
    updateActiveChapter
  );


  /* POZIȚIA INIȚIALĂ */

  updateActiveChapter();

}


/* =========================================================
   PORNIRE
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  initActiveNavSection
);



/* =========================================================
   EXPERIENȚĂ DE EXPLORARE — PROGRES, MICRO-POVEȘTI ȘI AMBIANȚĂ
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const chapterData = [
    { id: "istorie", label: "Istorie", icon: "fa-book-open" },
    { id: "geografie", label: "Geografie", icon: "fa-mountain-sun" },
    { id: "sate", label: "Sate", icon: "fa-house-chimney" },
    { id: "religie", label: "Religie", icon: "fa-church" },
    { id: "patrimoniu", label: "Patrimoniu", icon: "fa-landmark" },
    { id: "evenimente", label: "Evenimente", icon: "fa-people-group" },
    { id: "turism", label: "Turism", icon: "fa-route" },
    { id: "educatie", label: "Educație", icon: "fa-graduation-cap" },
    { id: "infrastructura", label: "Infrastructură", icon: "fa-road" }
  ].map(chapter => ({ ...chapter, element: document.getElementById(chapter.id) }))
    .filter(chapter => chapter.element);

  const progress = document.querySelector(".scroll-progress");
  if (progress && chapterData.length) {
    progress.removeAttribute("aria-hidden");
    const guide = document.createElement("div");
    guide.className = "chapter-guide";
    guide.setAttribute("aria-live", "polite");
    guide.innerHTML = `
      <span class="chapter-guide__icon"><i class="fas fa-book-open" aria-hidden="true"></i></span>
      <span class="chapter-guide__copy"><small>Explorezi</small><strong>Introducere</strong></span>
      <span class="chapter-guide__count">0 / ${chapterData.length}</span>
      <span class="chapter-guide__percent">0%</span>
    `;
    progress.append(guide);

    let activeIndex = -1;
    let storedVisited = [];
    try {
      const value = JSON.parse(sessionStorage.getItem("bustuchinVisitedChapters") || "[]");
      if (Array.isArray(value)) storedVisited = value.filter(id => chapterData.some(chapter => chapter.id === id));
    } catch { /* Reading remains available without storage. */ }
    const visited = new Set(storedVisited);
    let rememberVisits = true;
    const updateGuide = () => {
      const point = window.scrollY + window.innerHeight * .34;
      let nextIndex = -1;
      chapterData.forEach((chapter, index) => {
        if (point >= chapter.element.offsetTop) nextIndex = index;
      });
      if (nextIndex >= 0 && rememberVisits) {
        visited.add(chapterData[nextIndex].id);
        try { sessionStorage.setItem("bustuchinVisitedChapters", JSON.stringify([...visited])); } catch {}
      }
      if (nextIndex !== activeIndex) {
        activeIndex = nextIndex;
        const current = chapterData[Math.max(0, activeIndex)];
        guide.classList.remove("is-changing");
        void guide.offsetWidth;
        guide.classList.add("is-changing");
        guide.querySelector("i").className = `fas ${current.icon}`;
        guide.querySelector("strong").textContent = activeIndex < 0 ? "Introducere" : current.label;
        guide.querySelector(".chapter-guide__count").textContent =
          `${Math.max(0, activeIndex + 1)} / ${chapterData.length}`;
      }
      const total = document.documentElement.scrollHeight - innerHeight;
      const percent = total > 0 ? Math.round((scrollY / total) * 100) : 0;
      guide.querySelector(".chapter-guide__percent").textContent = `${Math.max(0, Math.min(100, percent))}%`;
      updateEpilogue();
    };

    let guideTicking = false;
    addEventListener("scroll", () => {
      if (guideTicking) return;
      guideTicking = true;
      requestAnimationFrame(() => {
        updateGuide();
        guideTicking = false;
      });
    }, { passive: true });
    addEventListener("resize", updateGuide, { passive: true });

    const epilogueMessage = document.querySelector(".site-epilogue__message");
    let explorationStatus = null;
    const updateEpilogue = () => {
      if (!epilogueMessage) return;
      if (!explorationStatus) {
        explorationStatus = document.createElement("div");
        explorationStatus.className = "exploration-summary";
        explorationStatus.innerHTML = `
          <i class="fas fa-compass" aria-hidden="true"></i>
          <div><span>Jurnalul explorării</span><strong></strong><nav aria-label="Capitole încă nevizitate"></nav></div>
        `;
        epilogueMessage.querySelector(".site-epilogue__actions")?.before(explorationStatus);
      }
      const missing = chapterData.filter(chapter => !visited.has(chapter.id));
      explorationStatus.querySelector("strong").textContent =
        `Ai parcurs ${visited.size} dintre cele ${chapterData.length} capitole.`;
      explorationStatus.querySelector("nav").innerHTML = missing.length
        ? `<span>Mai poți descoperi:</span> ${missing.slice(0, 4).map(chapter =>
            `<a href="#${chapter.id}">${chapter.label}</a>`).join("")}`
        : "<span>Ai descoperit întreaga monografie.</span>";
    };
    addEventListener('bustuchin:clear-reading', () => {
      rememberVisits = false;
      visited.clear();
      updateEpilogue();
    });
    updateGuide();
  }

  const facts = [
    {
      after: "istorie",
      icon: "fa-scroll",
      label: "Știai că?",
      question: "Primele repere documentare ale zonei coboară până în anul 1516.",
      answer: "În jurul vechilor așezări s-au format treptat satele și cătunele care alcătuiesc comuna de astăzi."
    },
    {
      after: "geografie",
      icon: "fa-water",
      label: "De reținut",
      question: "Valea Amaradiei a modelat atât relieful, cât și așezarea comunităților.",
      answer: "Apa, terasele și drumurile naturale ale văii au influențat dezvoltarea satelor și ocupațiile locuitorilor."
    },
    {
      after: "sate",
      icon: "fa-people-roof",
      label: "O comună, opt sate",
      question: "Bustuchinul este alcătuit din opt comunități cu povești și identități proprii.",
      answer: "Bustuchin, Cionți, Motorgi, Nămete, Pojaru, Poiana-Seciuri, Poienița și Valea Pojarului formează împreună comuna."
    }
  ];

  facts.forEach(fact => {
    const section = document.getElementById(fact.after);
    if (!section || document.querySelector(`[data-fact-after="${fact.after}"]`)) return;
    const card = document.createElement("aside");
    card.className = "discovery-fact reveal";
    card.dataset.factAfter = fact.after;
    card.innerHTML = `
      <button type="button" class="discovery-fact__button" aria-expanded="false">
        <span class="discovery-fact__icon"><i class="fas ${fact.icon}" aria-hidden="true"></i></span>
        <span class="discovery-fact__front"><small>${fact.label}</small><strong>${fact.question}</strong></span>
        <span class="discovery-fact__action">Descoperă <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
      </button>
      <div class="discovery-fact__answer" hidden><p>${fact.answer}</p></div>
    `;
    section.insertAdjacentElement("afterend", card);
    const button = card.querySelector("button");
    const answer = card.querySelector(".discovery-fact__answer");
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!open));
      card.classList.toggle("is-open", !open);
      answer.hidden = open;
      card.querySelector(".discovery-fact__action").firstChild.textContent = open ? "Descoperă " : "Închide ";
    });
  });

  const mobileReadingQuery = matchMedia("(max-width: 768px)");
  const initializeMobileReading = () => {
    if (!mobileReadingQuery.matches) return;
    document.querySelectorAll(".longform__text").forEach(text => {
      /* Unele capitole sunt ascunse la încărcare și au scrollHeight 0.
         Lungimea conținutului rămâne însă disponibilă și este un criteriu stabil. */
      const isLongStory = text.textContent.trim().length >= 650 || text.children.length >= 3;
      if (!isLongStory || text.dataset.readable === "true") return;
      text.dataset.readable = "true";
      text.classList.add("longform__text--collapsible", "is-collapsed");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "longform__toggle";
      button.setAttribute("aria-expanded", "false");
      button.innerHTML = '<span>Continuă povestea</span><i class="fas fa-chevron-down" aria-hidden="true"></i>';
      text.after(button);
      button.addEventListener("click", () => {
        const collapsed = text.classList.toggle("is-collapsed");
        button.setAttribute("aria-expanded", String(!collapsed));
        button.querySelector("span").textContent = collapsed ? "Continuă povestea" : "Restrânge textul";
      });
    });
  };
  initializeMobileReading();
  mobileReadingQuery.addEventListener?.("change", initializeMobileReading);

  const mappedPlaces = [
    "bustuchin", "cionti", "motorgi", "namete", "poiana-seciuri", "poienita", "pojaru",
    "valea-pojarului", "fantana-rece", "lacurile-de-la-poiana", "dealul-muierii",
    "biserica-bustuchin", "biserica-pojaru", "biserica-valea-pojarului", "biserica-poienita",
    "biserica-poiana", "biserica-din-valea-pojarului", "liceul-tehnologic-bustuchin",
    "scoala-poiana-seciuri", "scoala-primara-nr2", "gradinita-program-prelungit",
    "gradinita-nr2", "centru-persoane-varstnice", "infrastructura-locativa",
    "infrastructura-medicala", "infrastructura-culturala"
  ];
  mappedPlaces.forEach(id => {
    const place = document.getElementById(id);
    if (!place || place.querySelector(":scope > .context-map-link")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "context-map-link";
    button.innerHTML = '<i class="fas fa-location-dot" aria-hidden="true"></i><span>Vezi acest loc pe hartă</span>';
    button.addEventListener("click", () => {
      if (!window.navigateBustuchinToHash?.("#harta-comunei")) return;
      window.setTimeout(() => window.focusBustuchinMapLocation?.(id), 180);
    });
    place.prepend(button);
  });

  const soundButton = document.createElement("button");
  soundButton.type = "button";
  soundButton.className = "ambient-toggle";
  soundButton.setAttribute("aria-pressed", "false");
  soundButton.setAttribute("aria-label", "Alege ambianța sonoră");
  soundButton.innerHTML = '<i class="fas fa-volume-xmark" aria-hidden="true"></i><span>Ambianță</span>';
  document.body.append(soundButton);

  const ambientPicker = document.createElement("aside");
  ambientPicker.className = "ambient-picker";
  ambientPicker.hidden = true;
  ambientPicker.setAttribute("aria-label", "Alege ambianța sonoră");
  ambientPicker.innerHTML = `
    <div class="ambient-picker__heading">
      <span><i class="fas fa-headphones" aria-hidden="true"></i> Sunetul monografiei</span>
      <button type="button" class="ambient-picker__close" data-ambient-close aria-label="Închide selectorul de sunet"><i class="fas fa-xmark" aria-hidden="true"></i></button>
    </div>
    <p class="ambient-picker__intro">Alege fundalul care îți însoțește explorarea. Redarea pornește numai la alegerea ta.</p>
    <div class="ambient-picker__choices" role="group" aria-label="Opțiuni de sunet">
      <button type="button" class="ambient-choice" data-sound-mode="nature" aria-pressed="false">
        <i class="fas fa-tree" aria-hidden="true"></i><span><strong>Natura Bustuchinului</strong><small>Păsări, apă și foșnet de pădure</small></span><i class="fas fa-play ambient-choice__action" aria-hidden="true"></i>
      </button>
      <button type="button" class="ambient-choice" data-sound-mode="relax" aria-pressed="false">
        <i class="fas fa-radio" aria-hidden="true"></i><span><strong>Radio relaxare</strong><small>Muzică liniștită, redată live</small></span><i class="fas fa-play ambient-choice__action" aria-hidden="true"></i>
      </button>
    </div>
    <p class="ambient-picker__status" aria-live="polite"></p>
    <button type="button" class="ambient-picker__stop" data-sound-stop disabled><i class="fas fa-stop" aria-hidden="true"></i> Oprește sunetul</button>
  `;
  document.body.append(ambientPicker);

  const chapterGuide = document.querySelector(".chapter-guide");
  const mapButton = document.getElementById("floatingMapButton");
  if (chapterGuide && mapButton) {
    const dock = document.createElement("aside");
    dock.className = "explorer-dock";
    dock.setAttribute("aria-label", "Instrumente pentru explorarea monografiei");

    const ticker = document.createElement("div");
    ticker.className = "explorer-dock__ticker";
    ticker.setAttribute("aria-label", "Repere despre comuna Bustuchin");
    const tickerItems = [
      "Opt sate, o singură comunitate",
      "Comuna reunește satele Bustuchin, Cionți, Motorgi și Nămete",
      "Pojaru, Poiana-Seciuri, Poienița și Valea Pojarului completează comuna",
      "Bustuchin este satul de reședință și centrul administrativ al comunei",
      "Valea Amaradiei unește locurile și poveștile comunei",
      "Primele repere documentare ale zonei coboară până în anul 1516",
      "Un document emis la 3 noiembrie 1516 amintește vechi așezări ale zonei",
      "Reforma administrativă din 1968 a stabilit structura actuală a comunei",
      "Comuna Bustuchin se întinde pe o suprafață de 6.096 de hectare",
      "Așezarea comunei urmărește cursul superior al râului Amaradia",
      "Râul Amaradia este un afluent important al Jiului",
      "Amaradia are o lungime de aproximativ 99 de kilometri",
      "Relieful comunei este predominant colinar",
      "Unele culmi depășesc altitudinea de 500 de metri",
      "Relieful păstrează trăsăturile zonei subcarpatice a Gorjului",
      "Temperatura medie anuală este cuprinsă aproximativ între 8,7 și 11 grade Celsius",
      "În documentarea climatică apar valori extreme de până la minus 31 de grade Celsius",
      "Precipitațiile medii anuale variază aproximativ între 550 și 750 de milimetri",
      "În episoadele abundente, precipitațiile pot depăși 80 de milimetri în 24 de ore",
      "Vara, temperatura apei poate ajunge la aproximativ 23 de grade Celsius",
      "Amaradia este completată de numeroși afluenți și pâraie locale",
      "Versanții nordici păstrează mai multă umiditate decât cei însoriți",
      "Pădurile de gorun sunt caracteristice peisajului local",
      "Biserica de lemn din Strâmba–Valea Pojarului este înscrisă în Lista Monumentelor Istorice",
      "Biserica de lemn din Valea Pojarului a fost ridicată în anul 1737",
      "Lăcașul de lemn are hramul Nașterea Maicii Domnului",
      "Tradiția spune că biserica a fost construită pe malul stâng al pârâului Strâmba",
      "Biserica a fost strămutată la sfârșitul secolului al XVIII-lea",
      "Planul bisericii este dreptunghiular, cu altar poligonal în cinci laturi",
      "Sărbătoarea hramului este legată de ziua de 8 septembrie",
      "Bisericile comunei păstrează continuitatea vieții spirituale",
      "Pădurile, apele și dealurile alcătuiesc identitatea naturală a locului",
      "Solurile și relieful au susținut agricultura și pomicultura",
      "Livezile și culturile au fost mult timp în centrul vieții gospodăriilor",
      "Fântânile și cișmelele au fost locuri importante pentru comunitate",
      "Drumurile de pământ și căruțele făceau parte din peisajul de odinioară",
      "Casele tradiționale foloseau materiale locale, prispe, curți și grădini",
      "Nunțile păstrau cântece, costume și ritualuri transmise între generații",
      "Hora satului era deopotrivă joc, întâlnire și expresie a identității",
      "Petrolul, gazele naturale și lignitul au influențat dezvoltarea economică a comunei",
      "Industria petrolieră a adus locuri de muncă și transformări sociale",
      "Lampa cu petrol amintește viața gospodăriilor de dinaintea electrificării",
      "Portul popular păstrează o legătură directă cu tradițiile locale",
      "Documentele de familie pot completa povestea oficială a comunei",
      "Albumele vechi păstrează chipurile și viața generațiilor trecute",
      "Fotografiile comparative arată felul în care s-au schimbat locurile",
      "Arhiva digitală adună imagini, obiecte și mărturii locale",
      "Festivalul Iustina Băluțeanu păstrează vie memoria interpretei",
      "Festivalul Ștefan Popescu celebrează muzica și valoarea artistică",
      "Zilele Comunei aduc împreună locuitori, artiști și vizitatori",
      "Muzica, dansul și portul popular dau continuitate tradițiilor",
      "Profesorul Haralambie Bodescu a contribuit la formarea unor generații",
      "Școlile Bustuchinului duc povestea comunității către noile generații",
      "Liceul Tehnologic Bustuchin oferă pregătire teoretică și practică",
      "Școlile și grădinițele formează rețeaua educațională locală",
      "Programul prelungit sprijină educația și rutina zilnică a preșcolarilor",
      "Drumurile județene DJ 675A și DJ 675C susțin legăturile comunei",
      "DJ 675C asigură conexiunea cu drumul național DN 67B",
      "Drumurile comunale și vicinale asigură accesul către cele opt sate",
      "Rețelele de apă, energie și gaze fac parte din modernizarea comunei",
      "Telecomunicațiile facilitează accesul la educație și servicii digitale",
      "Cabinetele medicale susțin accesul local la servicii de sănătate",
      "Centrul pentru persoane vârstnice completează infrastructura socială",
      "Parcurile și locurile de joacă oferă spații pentru comunitate",
      "Terenurile de sport susțin mișcarea și întâlnirile dintre generații",
      "Casele de cultură găzduiesc spectacole, festivaluri și evenimente locale",
      "Proiectele de locuințe au adăugat noi opțiuni pentru familii și tineri",
      "Colectarea responsabilă a deșeurilor face parte din modernizarea locală",
      "Tradițiile locale sunt păstrate prin muzică, dans, port popular și sărbători",
      "Harta interactivă reunește satele, școlile, bisericile și obiectivele comunei",
      "Atlasul local cuprinde 27 de locuri care pot fi filtrate și explorate",
      "Fiecare sat are o poveste proprie în cadrul aceleiași comunități",
      "Traseele locale leagă patrimoniul cultural de peisajul natural",
      "Fotografiile de altădată păstrează memoria locurilor și a familiilor",
      "Descoperă patrimoniul, oamenii și natura Bustuchinului",
      "Comuna Bustuchin face parte din județul Gorj, iar așezările sale urmează cursul superior al Amaradiei",
      "Cele opt sate ale comunei păstrează legături de vecinătate, familie, muncă și tradiție, dincolo de hotarele administrative",
      "Harta locală ajută vizitatorii să localizeze sate, școli, biserici, infrastructură și obiective de interes comunitar",
      "Biserica de lemn din Strâmba–Valea Pojarului păstrează un reper valoros al arhitecturii religioase tradiționale din zonă",
      "Pădurile, livezile, cursurile de apă și dealurile completează cadrul natural al așezărilor comunei",
      "Agricultura, pomicultura și creșterea animalelor au rămas activități legate de ritmul anotimpurilor și al gospodăriei",
      "Rețeaua de drumuri leagă satele de centrul administrativ și susține deplasarea către localitățile din jur",
      "DJ 675C și DN 67B sunt repere importante pentru accesul rutier al comunei către restul județului",
      "Apa, energia, gazele, comunicațiile și serviciile publice fac parte din infrastructura care susține viața de zi cu zi",
      "Spațiile de joacă, terenurile sportive și activitățile pentru copii creează contexte de mișcare și întâlnire în comunitate",
      "Casele de cultură pot găzdui repetiții, spectacole, întâlniri și proiecte care pun în valoare viața locală",
      "Școala, biblioteca și inițiativele culturale aduc împreună memoria locului și educația noilor generații",
      "Liceul Tehnologic Bustuchin continuă tradiția educației locale prin pregătire școlară și practică",
      "Festivalurile locale oferă un cadru pentru muzică populară, dans, port tradițional și întâlnirea dintre generații",
      "Zilele Comunei Bustuchin reunesc program cultural, invitați, activități recreative și momente dedicate comunității",
      "Maratonul pentru Sănătate a adus în 2026 o inițiativă dedicată mișcării, sănătății și implicării comunitare",
      "Cupa Bustuchin la fotbal juniori pune accent pe prietenie, fair-play, respect și susținerea tinerilor",
      "Fotografiile, filmările și mărturiile locale pot păstra detalii care nu apar întotdeauna în documentele oficiale",
      "Comparațiile dintre imagini vechi și actuale arată cum s-au schimbat centrul comunei, gospodăriile și peisajul local",
      "Portul popular, cântecul și jocul rămân forme vii prin care comunitatea își exprimă identitatea",
      "Fântânile, cișmelele, prispele și curțile gospodăriilor vorbesc despre felul în care era organizată viața de odinioară",
      "Numele dealurilor, văilor și pâraielor păstrează urme ale peisajului, ale familiilor și ale ocupațiilor locale",
      "Biblioteca și arhiva digitală pot deveni locuri de întâlnire între document, fotografie, memorie și cercetare locală",
      "Harta interactivă permite filtrarea locurilor după categorie, pentru o explorare mai clară a comunei",
      "Fiecare obiectiv de pe hartă poate fi o poartă către o poveste: o școală, o biserică, un sat, un parc sau un loc de întâlnire",
      "Monografia digitală continuă să adune informații, imagini și materiale video care promovează comuna Bustuchin",
      "Respectarea patrimoniului înseamnă păstrarea clădirilor, a documentelor, a tradițiilor și a poveștilor oamenilor",
      "Informațiile locale devin mai utile atunci când pot fi descoperite ușor, comparate și transmise mai departe",
      "Bustuchinul se poate explora ca spațiu al naturii, al memoriei, al educației și al vieții comunitare"
    ];

    /* Ordine nouă la fiecare vizită: toate reperele apar înainte ca un mesaj să se repete. */
    const shuffleTickerItems = items => {
      const shuffled = [...items];
      for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
      }
      return shuffled;
    };
    const tickerKey = "bustuchin-last-ticker-reper";
    const tickerItemsShuffled = shuffleTickerItems(tickerItems);
    let lastTickerItem = "";
    try {
      lastTickerItem = sessionStorage.getItem(tickerKey) || "";
    } catch (error) {
      /* Stocarea este opțională. */
    }
    if (tickerItemsShuffled.length > 1 && tickerItemsShuffled[0] === lastTickerItem) {
      [tickerItemsShuffled[0], tickerItemsShuffled[1]] = [tickerItemsShuffled[1], tickerItemsShuffled[0]];
    }
    try {
      sessionStorage.setItem(tickerKey, tickerItemsShuffled[tickerItemsShuffled.length - 1]);
    } catch (error) {
      /* Stocarea este opțională. */
    }

    const tickerStories = [];
    for (let index = 0; index < tickerItemsShuffled.length; index += 2) {
      const first = tickerItemsShuffled[index];
      const second = tickerItemsShuffled[index + 1] || tickerItemsShuffled[0];
      tickerStories.push(`${first}. ${second}.`);
    }
    const tickerMarkup = [...tickerStories, ...tickerStories]
      .map(item => `<span>${item}</span><i aria-hidden="true"></i>`)
      .join("");
    ticker.innerHTML = `
      <span class="explorer-dock__live"><img src="img/logo.png" alt="" aria-hidden="true"> Info</span>
      <div class="explorer-dock__ticker-window">
        <div class="explorer-dock__ticker-track" aria-hidden="true">${tickerMarkup}</div>
      </div>
    `;

    document.body.append(dock);
    dock.append(ticker, chapterGuide, mapButton, soundButton);

    window.initBustuchinSearch({ chapterGuide, chapterData });
  }

  window.initBustuchinAudio({ soundButton, ambientPicker });

});
