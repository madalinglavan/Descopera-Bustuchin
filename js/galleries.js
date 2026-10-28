/* Media and editorial galleries. Loaded before the exploration/search index. */
/* =========================================================
   ZIUA INTERNAȚIONALĂ A PERSOANELOR VÂRSTNICE — GALERIE
========================================================= */
const initSeniorSlideshows = () => {
  document.querySelectorAll("[data-senior-slideshow]").forEach(slideshow => {
    const slides = Array.from(slideshow.querySelectorAll(".senior-gallery__slide"));
    const previous = slideshow.querySelector("[data-senior-prev]");
    const next = slideshow.querySelector("[data-senior-next]");
    const counter = slideshow.querySelector(".senior-gallery__controls b");
    if (slides.length < 2 || !previous || !next || !counter) return;

    let current = 0;
    let touchStart = 0;
    const showSlide = index => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === current;
        slide.hidden = !active;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", String(!active));
      });
      counter.textContent = String(current + 1).padStart(2, "0");
    };

    previous.addEventListener("click", () => showSlide(current - 1));
    next.addEventListener("click", () => showSlide(current + 1));
    slideshow.addEventListener("keydown", event => {
      if (event.key === "ArrowLeft") showSlide(current - 1);
      if (event.key === "ArrowRight") showSlide(current + 1);
    });
    slideshow.addEventListener("touchstart", event => {
      touchStart = event.touches[0].clientX;
    }, { passive: true });
    slideshow.addEventListener("touchend", event => {
      const distance = event.changedTouches[0].clientX - touchStart;
      if (Math.abs(distance) > 42) showSlide(current + (distance < 0 ? 1 : -1));
    }, { passive: true });
    showSlide(0);
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSeniorSlideshows, { once: true });
} else {
  initSeniorSlideshows();
}



/* =========================================================
   YOUTUBE LOAD ON CLICK
========================================================= */

document
.querySelectorAll(".video-preview")
.forEach(video => {

  const original =
    video.innerHTML;

  video.addEventListener("click", () => {

    if(
      video.querySelector("iframe")
    ) return;

    const id =
      video.dataset.video;

    video.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1"
        allow="autoplay; encrypted-media"
        allowfullscreen>
      </iframe>
    `;

  });

  const observer =
  new IntersectionObserver(entries => {

    entries.forEach(entry => {

      if(
        !entry.isIntersecting &&
        video.querySelector("iframe")
      ){

        video.innerHTML =
          original;

      }

    });

  },{
    threshold:.2
  });

  observer.observe(video);

});



/* =========================================================
   REVISTA TRADIȚII BUSTUCHINENE
========================================================= */

const magazineViewer = document.getElementById("magazineViewer");
const magazineEditionTitle = document.getElementById("magazineEditionTitle");
const magazineOpenPdf = document.getElementById("magazineOpenPdf");
const magazineEditions = document.querySelectorAll(".magazine-edition");

if (
  magazineViewer &&
  magazineEditionTitle &&
  magazineOpenPdf &&
  magazineEditions.length
) {

  magazineEditions.forEach((button) => {

    button.addEventListener("click", () => {

      const pdf = button.dataset.pdf;
      const edition = button.dataset.edition;

      magazineEditions.forEach((item) => {
        item.classList.remove("active");
      });

      button.classList.add("active");

      magazineViewer.src = `${pdf}#toolbar=1&navpanes=0&view=FitH`;
      magazineViewer.title =
        `Revista Tradiții Bustuchinene – ${edition}`;

      magazineEditionTitle.textContent =
        `Revista „Tradiții Bustuchinene” – ${edition}`;

      magazineOpenPdf.href = pdf;

      document.querySelector(".magazine-reader")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

    });

  });

}

/* =========================================================
   TRANZIȚII NARATIVE ÎNTRE CAPITOLE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  const chapters = [
    {
      target: "istorie",
      icon: "fa-book-open",
      eyebrow: "Istorie",
      message: "De aici începe povestea locului"
    },
    {
      target: "geografie",
      icon: "fa-mountain-sun",
      eyebrow: "Geografie",
      message: "Din trecut, spre locurile de astăzi"
    },
    {
      target: "sate",
      icon: "fa-tree-city",
      eyebrow: "Comunitate",
      message: "Opt sate. O singură comunitate."
    },
    {
      target: "religie",
      icon: "fa-church",
      eyebrow: "Credință",
      message: "Credință, memorie și continuitate"
    },
    {
      target: "patrimoniu",
      icon: "fa-landmark",
      eyebrow: "Patrimoniu",
      message: "Moștenirea păstrată din generație în generație"
    },
    {
      target: "evenimente",
      icon: "fa-people-group",
      eyebrow: "Tradiții",
      message: "Tradiția continuă prin oameni"
    },
    {
      target: "turism",
      icon: "fa-route",
      eyebrow: "Descoperire",
      message: "Locuri care merită descoperite"
    },
    {
      target: "educatie",
      icon: "fa-graduation-cap",
      eyebrow: "Educație",
      message: "Povestea merge mai departe prin noile generații"
    },
    {
      target: "infrastructura",
      icon: "fa-road",
      eyebrow: "Dezvoltare",
      message: "Rădăcini trainice. Un drum spre viitor."
    }
  ];

  const transitions = [];

  chapters.forEach((chapter) => {
    const section = document.getElementById(chapter.target);

    if (!section || section.previousElementSibling?.classList.contains("chapter-transition")) {
      return;
    }

    const transition = document.createElement("div");
    transition.className = `chapter-transition chapter-transition--${chapter.target}`;
    transition.dataset.chapter = chapter.target;
    transition.setAttribute("role", "separator");
    transition.setAttribute("aria-label", `Urmează capitolul ${chapter.eyebrow}`);
    transition.innerHTML = `
      <div class="chapter-transition__path" aria-hidden="true">
        <span class="chapter-transition__line chapter-transition__line--left"></span>
        <span class="chapter-transition__marker">
          <i class="fa-solid ${chapter.icon}"></i>
        </span>
        <span class="chapter-transition__line chapter-transition__line--right"></span>
      </div>
      <div class="chapter-transition__copy">
        <span class="chapter-transition__eyebrow">${chapter.eyebrow}</span>
        <p>${chapter.message}</p>
      </div>
    `;

    section.insertAdjacentElement("beforebegin", transition);
    transitions.push(transition);
  });

  if (!transitions.length) {
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    transitions.forEach((transition) => transition.classList.add("is-visible"));
    return;
  }

  const transitionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.42,
    rootMargin: "0px 0px -8%"
  });

  transitions.forEach((transition) => transitionObserver.observe(transition));
});


/* =========================================================
   LAYOUT EDITORIAL PENTRU SECȚIUNILE CU TEXT LUNG
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const candidates = document.querySelectorAll(".split-layout, .section--villages .village");

  candidates.forEach((block) => {
    const content = block.querySelector(":scope > .section-block__content, :scope > .village__content");
    const media = block.querySelector(":scope > .section-block__media, :scope > .village__media, :scope > .video-preview");

    if (!content || !media || block.classList.contains("split-layout--longform")) {
      return;
    }

    if (block.matches(".culture-person, .culture-living, .culture-publication, .event-card")) {
      const culturalParagraphs = Array.from(content.children).filter((element) =>
        element.matches("p.section-block__text")
      );

      if (culturalParagraphs.length > 2 && !content.querySelector(":scope > .culture-story")) {
        const culturalStory = document.createElement("div");
        culturalStory.className = "culture-story";
        culturalParagraphs[0].insertAdjacentElement("beforebegin", culturalStory);
        culturalParagraphs.forEach((paragraph) => culturalStory.appendChild(paragraph));
      }

      return;
    }

    const paragraphs = Array.from(content.children).filter((element) =>
      element.matches("p.section-block__text")
    );

    if (paragraphs.length < 4) {
      return;
    }

    const textFlow = document.createElement("div");
    textFlow.className = "longform__text";
    paragraphs[0].insertAdjacentElement("beforebegin", textFlow);
    paragraphs.forEach((paragraph) => textFlow.appendChild(paragraph));

    block.classList.add("split-layout--longform");

    const image = media.querySelector("img");

    if (image) {
      const updateOrientation = () => {
        const isPortraitLike = image.naturalWidth > 0 &&
          image.naturalHeight >= image.naturalWidth * 0.9;

        block.classList.toggle("longform--portrait-media", isPortraitLike);
      };

      if (image.complete) {
        updateOrientation();
      }

      image.addEventListener("load", updateOrientation, { once: true });
    }
  });
});

/* =========================================================
   PARCURI, LOCURI DE JOACĂ ȘI BAZE SPORTIVE
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const section = document.getElementById("parcuri-spatii-joaca");
  if (!section) return;

  const cards = Array.from(section.querySelectorAll("[data-facility]"));
  const buttons = Array.from(section.querySelectorAll("[data-facility-filter]"));
  const count = section.querySelector(".community-facilities__count b");

  const applyFilter = (filter) => {
    let visible = 0;
    cards.forEach((card) => {
      const show = filter === "all" || card.dataset.facility === filter;
      card.hidden = !show;
      card.setAttribute("aria-hidden", String(!show));
      if (show) visible += 1;
    });
    buttons.forEach((button) => {
      const active = button.dataset.facilityFilter === filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    if (count) count.textContent = String(visible);
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => applyFilter(button.dataset.facilityFilter));
  });

  cards.forEach((card) => {
    const image = card.querySelector("img");
    const media = card.querySelector(".facility-card__media");
    if (!image || !media) return;
    media.dataset.placeholder = image.alt;
    const updateImageState = () => card.classList.toggle("is-missing-image", !image.naturalWidth);
    if (image.complete) updateImageState();
    image.addEventListener("load", updateImageState);
    image.addEventListener("error", updateImageState);
  });

  applyFilter("all");
});

/* Marchează începuturile blocurilor de lectură fără să modifice conținutul.
   Astfel, monografia capătă ritmul unei ediții editoriale și rămâne ușor de
   parcurs atât pe ecrane mari, cât și pe telefon. */
const enhanceEditorialOpenings = () => {
  const paragraphSelector = [
    "main .section-block__content > p.section-block__text",
    "main .longform__text > p.section-block__text",
    "main .toponimie > p.section-block__text",
    "main .event-card__content > p",
    "main .tourism-stop__copy > p"
  ].join(",");

  const openedGroups = new Set();
  document.querySelectorAll(paragraphSelector).forEach((paragraph) => {
    if (paragraph.textContent.trim().length < 120) return;

    const group = paragraph.parentElement;
    if (!group || openedGroups.has(group)) return;
    openedGroups.add(group);
    paragraph.classList.add("is-editorial-opening");

    const textNode = Array.from(paragraph.childNodes).find((node) =>
      node.nodeType === Node.TEXT_NODE && node.nodeValue.trim()
    );
    if (!textNode) return;

    const match = textNode.nodeValue.match(/^(\s*[„“"«(]*)([\p{L}][\p{L}'’-]*)/u);
    if (!match) return;

    const fragment = document.createDocumentFragment();
    if (match[1]) fragment.append(document.createTextNode(match[1]));
    const firstWord = document.createElement("span");
    firstWord.className = "editorial-first-word";
    firstWord.textContent = match[2];
    fragment.append(firstWord, document.createTextNode(textNode.nodeValue.slice(match[0].length)));
    textNode.replaceWith(fragment);
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", enhanceEditorialOpenings, { once: true });
} else {
  enhanceEditorialOpenings();
}


/* Imaginile încă neadăugate nu mai lasă spații goale în cardurile de memorie. */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("#bustuchin-altadata :is(.memory-card, .memory-object, .memory-portrait) img").forEach((image) => {
    const card = image.closest(".memory-card, .memory-object, .memory-portrait");

    const updateImageState = () => {
      const isMissing = !image.naturalWidth;
      card?.classList.toggle("memory-item--missing-image", isMissing);
      card?.classList.toggle("memory-card--missing-image", isMissing && card.classList.contains("memory-card"));
    };

    if (image.complete) {
      updateImageState();
    }

    image.addEventListener("load", updateImageState, { once: true });
    image.addEventListener("error", updateImageState, { once: true });
  });
});

/* =========================================================
   BUSTUCHINUL DE ALTĂDATĂ — COMPARAȚII ȘI CARUSELE
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const sourceLocation = document.querySelector("[data-location-gallery]");

  if (sourceLocation) {
    const locations = [
      {
        old: "img/bustuchinul de altadata.webp",
        now: "img/bustuchin astazi.webp",
        oldAlt: "Centrul Bustuchinului în trecut",
        nowAlt: "Centrul Bustuchinului în prezent",
        number: "Locul nr. 01",
        title: "Centrul comunei Bustuchin",
        text: "Aceeași zonă, surprinsă în două momente diferite ale istoriei locale."
      },
      {
        old: "img/altadata/pojaru-atunci.webp",
        now: "img/altadata/pojaru-acum.webp",
        oldAlt: "Centrul satului Pojaru în trecut",
        nowAlt: "Centrul satului Pojaru în prezent",
        number: "Locul nr. 02",
        title: "Centrul satului Pojaru",
        text: "O privire comparativă asupra felului în care s-a schimbat vatra satului."
      },
      {
        old: "img/altadata/poiana-atunci.webp",
        now: "img/altadata/poiana-acum.webp",
        oldAlt: "Satul Poiana în trecut",
        nowAlt: "Satul Poiana în prezent",
        number: "Locul nr. 03",
        title: "Satul Poiana",
        text: "Drumurile, gospodăriile și peisajul local, păstrate în două epoci."
      },
      {
        old: "img/altadata/scoala-atunci.webp",
        now: "img/altadata/scoala-acum.webp",
        oldAlt: "Școala din Bustuchin în trecut",
        nowAlt: "Școala din Bustuchin în prezent",
        number: "Locul nr. 04",
        title: "Școala din Bustuchin",
        text: "Locul în care generații de copii au învățat, văzut ieri și astăzi."
      }
    ];

    const gallery = document.createElement("div");
    gallery.className = "memory-location-gallery";
    sourceLocation.before(gallery);
    sourceLocation.removeAttribute("data-location-gallery");

    locations.forEach((location, index) => {
      const card = index === 0 ? sourceLocation : sourceLocation.cloneNode(true);
      const images = card.querySelectorAll(".memory-compare__image img");
      images[0].src = location.old;
      images[0].alt = location.oldAlt;
      images[1].src = location.now;
      images[1].alt = location.nowAlt;
      card.querySelector(".memory-compare__caption > span").textContent = location.number;
      card.querySelector(".memory-compare__caption h4").textContent = location.title;
      card.querySelector(".memory-compare__caption p").textContent = location.text;
      card.classList.toggle("is-active", index === 0);
      card.hidden = index !== 0;
      card.setAttribute("aria-hidden", String(index !== 0));
      gallery.append(card);
    });

    const navigation = document.createElement("div");
    navigation.className = "memory-location-gallery__navigation";
    navigation.innerHTML = `
      <button type="button" data-location-prev aria-label="Locul anterior"><i class="fas fa-arrow-left"></i></button>
      <div class="memory-location-gallery__status">
        <span>Arhiva locurilor</span>
        <strong><b>01</b> / 04</strong>
      </div>
      <div class="memory-location-gallery__dots" aria-label="Alege un loc"></div>
      <button type="button" data-location-next aria-label="Locul următor"><i class="fas fa-arrow-right"></i></button>
    `;
    gallery.append(navigation);

    const cards = Array.from(gallery.querySelectorAll(":scope > .memory-compare"));
    const dots = navigation.querySelector(".memory-location-gallery__dots");
    cards.forEach((card, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Arată locul ${index + 1}`);
      dot.classList.toggle("is-active", index === 0);
      dots.append(dot);
    });

    let currentLocation = 0;
    const showLocation = (index) => {
      currentLocation = (index + cards.length) % cards.length;
      cards.forEach((card, cardIndex) => {
        const active = cardIndex === currentLocation;
        card.hidden = !active;
        card.classList.toggle("is-active", active);
        card.setAttribute("aria-hidden", String(!active));
      });
      Array.from(dots.children).forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === currentLocation));
      navigation.querySelector("strong b").textContent = String(currentLocation + 1).padStart(2, "0");
    };

    navigation.querySelector("[data-location-prev]").addEventListener("click", () => showLocation(currentLocation - 1));
    navigation.querySelector("[data-location-next]").addEventListener("click", () => showLocation(currentLocation + 1));
    Array.from(dots.children).forEach((dot, index) => dot.addEventListener("click", () => showLocation(index)));
  }

  document.querySelectorAll("[data-before-after]").forEach((comparison) => {
    const range = comparison.querySelector(".memory-compare__range");
    if (!range) return;

    const updateComparison = () => {
      comparison.style.setProperty("--compare-position", `${range.value}%`);
      range.setAttribute("aria-valuetext", `${range.value}% fotografie actuală`);
    };

    range.addEventListener("input", updateComparison);
    updateComparison();

    comparison.querySelectorAll(".memory-compare__image img").forEach((image) => {
      const frame = image.closest(".memory-compare__image");
      frame.dataset.placeholder = image.alt;
      const updateImageState = () => frame.classList.toggle("is-missing", !image.naturalWidth);
      if (image.complete) updateImageState();
      image.addEventListener("load", updateImageState);
      image.addEventListener("error", updateImageState);
    });
  });

  document.querySelectorAll("[data-memory-slider]").forEach((slider) => {
    const originalImage = slider.querySelector(":scope > img");
    const nowSource = slider.dataset.nowSrc;
    const title = slider.dataset.title || "Imagine";
    if (!originalImage || !nowSource) return;

    const track = document.createElement("div");
    track.className = "memory-mini-slider__track";

    const createSlide = (image, label, placeholder) => {
      const slide = document.createElement("figure");
      slide.className = "memory-mini-slider__slide";
      const badge = document.createElement("figcaption");
      badge.textContent = label;
      const emptyState = document.createElement("span");
      emptyState.className = "memory-mini-slider__placeholder";
      emptyState.innerHTML = `<i class="fas fa-image"></i><strong>${placeholder}</strong><small>Înlocuiește imaginea din dosarul img/altadata</small>`;
      slide.append(image, emptyState, badge);

      const updateState = () => slide.classList.toggle("is-missing", !image.naturalWidth);
      if (image.complete) updateState();
      image.addEventListener("load", updateState);
      image.addEventListener("error", updateState);
      return slide;
    };

    originalImage.remove();
    const nowImage = document.createElement("img");
    nowImage.src = nowSource;
    nowImage.alt = `${title} în prezent`;
    nowImage.loading = "lazy";

    track.append(
      createSlide(originalImage, "Altădată", `${title} — fotografie de altădată`),
      createSlide(nowImage, "Astăzi", `${title} — fotografie actuală`)
    );

    const controls = document.createElement("div");
    controls.className = "memory-mini-slider__controls";
    controls.innerHTML = `
      <button type="button" data-slide-prev aria-label="Imaginea anterioară"><i class="fas fa-arrow-left"></i></button>
      <span><b>1</b> / 2</span>
      <button type="button" data-slide-next aria-label="Imaginea următoare"><i class="fas fa-arrow-right"></i></button>
    `;
    slider.prepend(track);
    slider.append(controls);

    let currentSlide = 0;
    let touchStart = 0;
    const showSlide = (index) => {
      currentSlide = (index + 2) % 2;
      track.style.transform = `translateX(-${currentSlide * 50}%)`;
      controls.querySelector("b").textContent = String(currentSlide + 1);
    };

    controls.querySelector("[data-slide-prev]").addEventListener("click", () => showSlide(currentSlide - 1));
    controls.querySelector("[data-slide-next]").addEventListener("click", () => showSlide(currentSlide + 1));
    slider.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") showSlide(currentSlide - 1);
      if (event.key === "ArrowRight") showSlide(currentSlide + 1);
    });
    slider.addEventListener("touchstart", (event) => { touchStart = event.touches[0].clientX; }, { passive: true });
    slider.addEventListener("touchend", (event) => {
      const distance = event.changedTouches[0].clientX - touchStart;
      if (Math.abs(distance) > 45) showSlide(currentSlide + (distance < 0 ? 1 : -1));
    }, { passive: true });
    slider.tabIndex = 0;
    slider.setAttribute("role", "region");
    slider.setAttribute("aria-label", `Galerie: ${title}`);
  });
});

/* =========================================================
   CASELE DE CULTURĂ — GALERIE
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const section = document.getElementById("case-de-cultura");
  const viewport = section?.querySelector(".culture-houses__viewport");
  const track = section?.querySelector(".culture-houses__track");
  const cards = track ? Array.from(track.children) : [];
  if (!section || !viewport || !track || !cards.length) return;

  let activeCard = 0;
  const counter = section.querySelector(".culture-houses__controls b");

  const updateGallery = (index) => {
    activeCard = Math.max(0, Math.min(cards.length - 1, index));
    cards[activeCard].scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "nearest",
      inline: "start"
    });
    if (counter) counter.textContent = String(activeCard + 1).padStart(2, "0");
  };

  section.querySelector("[data-culture-prev]")?.addEventListener("click", () => updateGallery(activeCard - 1));
  section.querySelector("[data-culture-next]")?.addEventListener("click", () => updateGallery(activeCard + 1));

  viewport.addEventListener("scroll", () => {
    const nearest = cards.reduce((best, card, index) => {
      const distance = Math.abs(card.offsetLeft - viewport.scrollLeft);
      return distance < best.distance ? { index, distance } : best;
    }, { index: 0, distance: Infinity });
    activeCard = nearest.index;
    if (counter) counter.textContent = String(activeCard + 1).padStart(2, "0");
  }, { passive: true });

  cards.forEach((card) => {
    const image = card.querySelector("img");
    const media = card.querySelector(".culture-house-card__media");
    if (!image || !media) return;
    media.dataset.placeholder = image.alt;
    const updateImageState = () => card.classList.toggle("is-missing-image", !image.naturalWidth);
    if (image.complete) updateImageState();
    image.addEventListener("load", updateImageState);
    image.addEventListener("error", updateImageState);
  });
});

