/* Interactive map and accessible place directory. */
async function initBustuchinMap() {

  /* =======================================================
     ELEMENT HARTĂ
  ======================================================= */

  const mapElement =
    document.getElementById("bustuchinMap");


  if (!mapElement) {
    return;
  }


  /* =======================================================
     CATEGORII
  ======================================================= */

  const categories = {

    village: {
      label: "Sat",
      icon: "fa-house"
    },

    tourism: {
      label: "Turism",
      icon: "fa-tree"
    },

    religion: {
      label: "Patrimoniu",
      icon: "fa-church"
    },

    education: {
      label: "Educație",
      icon: "fa-graduation-cap"
    },
    monument: {
      label: "Monument istoric",
      icon: "fa-landmark"
    },
    infrastructura: {
      label: "Infrastructura",
      icon: "fa-city"
    },
    community: {
      label: "Sport și joacă",
      icon: "fa-futbol"
    },
    services: {
      label: "Servicii publice",
      icon: "fa-hand-holding-heart"
    },
    housing: {
      label: "Locuire",
      icon: "fa-building"
    },
    culture: {
      label: "Cultură",
      icon: "fa-masks-theater"
    }

  };


  /* =======================================================
     LOCURILE DE PE HARTĂ

     id = ID-ul secțiunii din HTML

     Exemple:
     id: "pojaru"
     -> navighează la #pojaru

     category:
     village
     tourism
     religion
     education
     community
     services
     housing
     culture
  ======================================================= */

  const mapLocations = [

    /* =====================================================
       SATE
    ===================================================== */

    {
      id: "bustuchin",

      name: "Bustuchin",

      category: "village",

      lat: 44.96452,

      lng: 23.72814
    },


    {
      id: "cionti",

      name: "Cionți",

      category: "village",

      lat: 44.96595,

      lng: 23.68434
    },


    {
      id: "motorgi",

      name: "Motorgi",

      category: "village",

      lat: 44.97773,

      lng: 23.68391
    },


    {
      id: "namete",

      name: "Nămete",

      category: "village",

      lat: 44.98310,

      lng: 23.70205
    },


    {
      id: "poiana-seciuri",

      name: "Poiana-Seciuri",

      category: "village",

      lat: 44.99191,

      lng: 23.72536
    },


    {
      id: "poienita",

      name: "Poienița",

      category: "village",

      lat: 44.99267,

      lng: 23.68150
    },


    {
      id: "pojaru",

      name: "Pojaru",

      category: "village",

      lat: 44.93860,

      lng: 23.69542
    },


    {
      id: "valea-pojarului",

      name: "Valea Pojarului",

      category: "village",

      lat: 44.93230,

      lng: 23.72700
    }
,
       {
         id: "fantana-rece",
         name: "Fântâna Rece",
         category: "tourism",
         lat: 44.969408,
         lng: 23.760961
       }
,
,
       {
         id: "lacurile-de-la-poiana",
         name: "Lacurile de la Poiana-Seciuri",
         category: "tourism",
         lat: 45.005435,
         lng: 23.743231


       }
,
,
       {
         id: "dealul-muierii",
         name: "Dealul Muierii",
         category: "tourism",
         lat: 44.985166,
         lng: 23.760546


       }
,
       {
         id: "biserica-bustuchin",
         name: "Biserica Bustuchin",
         category: "religion",
         lat: 44.975502,
         lng: 23.725401


       }
 ,
       {
         id: "biserica-pojaru",
         name: "Biserica Pojaru",
         category: "religion",
         lat: 44.945505,
         lng: 23.707883


       }
,
       {
         id: "biserica-valea-pojarului",
         name: "Biserica Valea Pojarului",
         category: "religion",
         lat: 44.938034,
         lng: 23.727402


       }
,
       {
         id: "biserica-poienita",
         name: "Biserica Poienita",
         category: "religion",
         lat: 44.990881,
         lng: 23.681493

       }
,
       {
         id: "biserica-poiana",
         name: "Biserica Poiana Seciuri",
         category: "religion",
         lat: 44.988755,
         lng: 23.723080


       }
,
       
       {
         id: "biserica-din-valea-pojarului",
         name: "Biserica de lemn din Valea Pojarului",
         category: "monument",
         lat: 44.938134,
         lng: 23.727307
       }
,
       {
         id: "liceul-tehnologic-bustuchin",
         name: "Liceul Tehnologic Bustuchin",
         category: "education",
         lat: 44.952382,
         lng: 23.712845
       }
       ,
       {
         id: "scoala-poiana-seciuri",
         name: "Școala Gimnazială Poiana-Seciuri",
         category: "education",
         lat: 45.001266,
         lng: 23.724950
       }
    ,
       {
         id: "scoala-primara-nr2",
         name: "Școala Primara Nr.2",
         category: "education",
         lat: 44.974433,
         lng: 23.725543

       }
   
       ,
       {
         id: "gradinita-program-prelungit",
         name: "Grădinița cu Program Prelungit",
         category: "education",
         lat: 44.952288,
         lng: 23.713439


       }
       ,
       {
         id: "gradinita-nr2",
         name: "Gradinita nr2",
         category: "education",
         lat: 44.971261,
         lng: 23.730856

       }
       ,
       {
         id: "centru-persoane-varstnice",
         name: "Centrul de zi si noapte pentru persoanele varstnice",
         category: "services",
         lat: 45.008068,
         lng: 23.730713

       }
,
       {
         id: "infrastructura-locativa",
         name: "Bloc ANL",
         category: "housing",
         lat: 44.973222,
         lng: 23.725497

       }
       ,
       {
         id: "infrastructura-locativa",
         name: "Locuinte sociale",
         category: "housing",
         lat: 44.951237,
         lng: 23.711989

       }
       ,
       {
         id: "infrastructura-medicala",
         name: "Cabinet Medical",
         category: "services",
         lat: 44.954279,
         lng: 23.714761

       }
       ,
       {
         id: "infrastructura-culturala",
         name: "Stadionul Bustuchin · teren principal",
         category: "infrastructura",
         lat: 44.950537,
         lng: 23.714770,
         description: "Teren principal cu nocturnă, tribune și gazon natural, pregătit pentru meciuri și competiții locale."
       },
       {
         id: "case-de-cultura",
         name: "Căminul Cultural Poiana-Seciuri și spațiul de joacă",
         category: "culture",
         lat: 44.995047,
         lng: 23.724695,
         description: "Spațiu pentru întâlnirile comunității, activități culturale și joaca celor mici."
       },
       {
         id: "parcuri-spatii-joaca",
         name: "Spațiu de joacă Poiana-Seciuri",
         category: "community",
         lat: 45.007178,
         lng: 23.729400,
         description: "Loc de recreere și joacă destinat copiilor din comunitate."
       },
       {
         id: "case-de-cultura",
         name: "Căminul Cultural Pojaru",
         category: "culture",
         lat: 44.945005,
         lng: 23.693614,
         description: "Spațiu comunitar pentru activități culturale, tradiții și întâlniri locale."
       },
       {
         id: "parcuri-spatii-joaca",
         name: "Spațiu de joacă Pojaru",
         category: "community",
         lat: 44.945522,
         lng: 23.693271,
         description: "Loc de joacă pentru copii și familiile din satul Pojaru."
       },
       {
         id: "parcuri-spatii-joaca",
         name: "Spațiu de joacă Nămete",
         category: "community",
         lat: 44.984237,
         lng: 23.699547,
         description: "Loc de joacă și întâlnire pentru copiii din satul Nămete."
       },
       {
         id: "parcuri-spatii-joaca",
         name: "Spațiu de joacă Valea Pojarului",
         category: "community",
         lat: 44.935318,
         lng: 23.726339,
         description: "Spațiu de recreere pentru copii, familii și comunitatea din Valea Pojarului."
       },
       {
         id: "parcuri-spatii-joaca",
         name: "Spațiu de joacă Poienița",
         category: "community",
         lat: 44.992272,
         lng: 23.680214,
         description: "Loc de joacă destinat copiilor și timpului petrecut în aer liber."
       },
       {
         id: "parcuri-spatii-joaca",
         name: "Spațiu de joacă Bustuchin",
         category: "community",
         lat: 44.952302,
         lng: 23.714000,
         description: "Loc de joacă pentru cei mici, amplasat în zona centrală a comunei."
       },
       {
         id: "parcuri-spatii-joaca",
         name: "Teren sintetic Poiana-Seciuri",
         category: "community",
         lat: 45.001011,
         lng: 23.725412,
         description: "Teren de fotbal sintetic amenajat în curtea Școlii Gimnaziale Poiana-Seciuri."
       },
       {
         id: "parcuri-spatii-joaca",
         name: "Teren sintetic Bustuchin · Școala Nr. 2",
         category: "community",
         lat: 44.974448,
         lng: 23.725590,
         description: "Teren de fotbal sintetic amplasat în curtea Școlii Primare Nr. 2."
       },
       {
         id: "parcuri-spatii-joaca",
         name: "Teren sintetic Bustuchin · centru",
         category: "community",
         lat: 44.950477,
         lng: 23.714877,
         description: "Teren sintetic pentru mișcare, antrenament și activități sportive locale."
       },
       {
         id: "infrastructura-culturala",
         name: "Piscina Bustuchin",
         category: "infrastructura",
         lat: 44.950477,
         lng: 23.714877,
         description: "Obiectiv de agrement deschis în sezonul de vară."
       },
       {
         id: "infrastructura-culturala",
         name: "Stadionul Bustuchin · teren de antrenamente",
         category: "community",
         lat: 44.949466,
         lng: 23.714141,
         description: "Teren destinat antrenamentelor și activităților sportive ale comunității."
       }

  ];

  // The list remains useful with screen readers, offline, or when Leaflet cannot load.
  const directory = document.createElement("details");
  directory.className = "map-directory";
  const summary = document.createElement("summary");
  summary.textContent = "Obiective și trasee · lista accesibilă";
  directory.append(summary);
  const list = document.createElement("ul");
  mapLocations.forEach(location => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = `#${location.id}`; link.textContent = location.name;
    const route = document.createElement("a");
    route.href = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
    route.target = "_blank"; route.rel = "noopener noreferrer";
    route.textContent = "Traseu"; route.setAttribute("aria-label", `Traseu către ${location.name}`);
    item.append(link, route); list.append(item);
  });
  directory.append(list);
  document.getElementById("mapInteraction")?.after(directory);
  if (typeof L === "undefined") {
    directory.open = true;
    const status = document.createElement("p");
    status.className = "material-note";
    status.textContent = "Harta nu este disponibilă acum. Poți explora obiectivele din lista de mai jos; traseele necesită internet.";
    document.getElementById("mapInteraction")?.replaceWith(status);
    return;
  }

  /* =======================================================
     CREARE HARTĂ
  ======================================================= */

  const map =
    L.map(
      mapElement,
      {

        zoomControl:
          true,

        scrollWheelZoom:
          false,

        doubleClickZoom:
          false,

        dragging:
          false,

        touchZoom:
          false,

        keyboard: false,
        boxZoom: false,
        tapHold: false

      }
    );


  /* =======================================================
     OPENSTREETMAP
  ======================================================= */

  L.tileLayer(

    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

    {

      maxZoom:
        19,

      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

    }

  )
  .addTo(map);


  /* =======================================================
     LIMITA OFICIALĂ UAT BUSTUCHIN — ANCPI

     SIRUTA BUSTUCHIN = 79406
  ======================================================= */

  let bustuchinBoundary =
    null;

/* =======================================================
   LIMITA UAT BUSTUCHIN — FIȘIER LOCAL
======================================================= */

async function loadBustuchinBoundary() {

  try {

    const response =
      await fetch(
        "data/bustuchin-boundary.geojson"
      );


    if (!response.ok) {

      throw new Error(
        `GeoJSON HTTP ${response.status}`
      );

    }


    const geoJSON =
      await response.json();


    if (
      !geoJSON.features ||
      !geoJSON.features.length
    ) {

      throw new Error(
        "Fișierul GeoJSON nu conține geometria Bustuchin."
      );

    }


    /* ===================================================
       DESENEAZĂ HOTARUL
    =================================================== */

    bustuchinBoundary =
      L.geoJSON(
        geoJSON,
        {

          style: {

            color:
              "#38bdf8",

            weight:
              4,

            opacity:
              1,

            dashArray:
              "10 7",

            lineCap:
              "round",

            lineJoin:
              "round",

            fillColor:
              "#2563eb",

            fillOpacity:
              0.08

          },

          interactive:
            false

        }
      )
      .addTo(map);


    /* Hotarul rămâne sub markere */

    bustuchinBoundary.bringToBack();


    console.log(
      "Hotarul Bustuchin a fost încărcat cu succes."
    );


    return bustuchinBoundary;

  }


  catch (error) {

    console.error(
      "Nu am putut încărca hotarul Bustuchin:",
      error
    );


    return null;

  }

}

  /* =======================================================
     COORDONATE MARKERE
  ======================================================= */

  const markerCoordinates =
    [];

  const markerRecords = [];


  /* =======================================================
     CREARE MARKERE
  ======================================================= */

  mapLocations.forEach(
    location => {

      const category =
        categories[
          location.category
        ];


      if (!category) {
        return;
      }


      const coordinates = [

        location.lat,

        location.lng

      ];


      markerCoordinates.push(
        coordinates
      );


      /* ===================================================
         ICON
      =================================================== */

      const markerIcon =
        L.divIcon({

          className:
            "community-marker-wrapper",

          html: `

            <div
              class="
                community-marker
                community-marker--${location.category}
              ">

              <i
                class="
                  fas
                  ${category.icon}
                "
                aria-hidden="true">
              </i>

            </div>

          `,

          iconSize:
            [42, 42],

          iconAnchor:
            [21, 42],

          popupAnchor:
            [0, -36]

        });


      /* ===================================================
         MARKER
      =================================================== */

      const marker =
        L.marker(
          coordinates,
          {

            icon:
              markerIcon,

            title:
              location.name,

            riseOnHover:
              true

          }
        )
        .addTo(map);

      markerRecords.push({
        marker,
        location,
        category
      });


      /* ===================================================
         POPUP
      =================================================== */

      const popupContent = `

        <div class="map-popup">

          <span class="map-popup__category">

            ${category.label}

          </span>


          <strong class="map-popup__title">

            ${location.name}

          </strong>

          ${location.description ? `<p class="map-popup__description">${location.description}</p>` : ""}


          <button
            type="button"
            class="map-popup__button"
            data-map-target="${location.id}">

            Descoperă locul

            <i
              class="fas fa-arrow-right"
              aria-hidden="true">
            </i>

          </button>

          <a
            class="map-popup__route"
            href="https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}"
            target="_blank"
            rel="noopener noreferrer">
            <i class="fas fa-route" aria-hidden="true"></i>
            Traseu până aici
          </a>

        </div>

      `;


      marker.bindPopup(
        popupContent,
        {

          className:
            "community-map-popup",

          closeButton:
            false,

          maxWidth:
            250,

          minWidth:
            170,

          autoPan:
            true,

          autoPanPadding:
            [40, 40]

        }
      );

    }
  );

  /* =======================================================
     ATLAS LOCAL — CĂUTARE, FILTRE ȘI CONTROLUL HĂRȚII
  ======================================================= */

  const searchInput = document.getElementById("mapSearch");
  const searchResults = document.getElementById("mapSearchResults");
  const resultsCount = document.getElementById("mapResultsCount");
  const resetViewButton = document.getElementById("mapResetView");
  const legendItems = document.querySelectorAll(".community-map__legend-item");
  let activeMapCategory = "all";

  const normalizeMapText = value => value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  const updateMapCount = count => {
    if (!resultsCount) return;
    resultsCount.textContent = count === 1
      ? "1 loc afișat"
      : `${count} locuri afișate`;
  };

  const showMarkerRecord = record => {
    map.flyTo([record.location.lat, record.location.lng], 16, {
      duration: .8
    });
    window.setTimeout(() => record.marker.openPopup(), 450);
    if (searchResults) searchResults.classList.remove("is-visible");
  };

  window.focusBustuchinMapLocation = locationId => {
    const record = markerRecords.find(item => item.location.id === locationId);
    if (!record) return false;
    activeMapCategory = "all";
    if (searchInput) searchInput.value = "";
    legendItems.forEach(item => {
      item.classList.remove("is-active");
      item.setAttribute("aria-pressed", "false");
    });
    applyMapFilters();
    showMarkerRecord(record);
    return true;
  };

  const applyMapFilters = () => {
    const query = normalizeMapText(searchInput?.value || "");
    const matches = markerRecords.filter(record => {
      const categoryMatches = activeMapCategory === "all" || record.location.category === activeMapCategory;
      const textMatches = !query || normalizeMapText(`${record.location.name} ${record.category.label}`).includes(query);
      return categoryMatches && textMatches;
    });

    markerRecords.forEach(record => {
      const visible = matches.includes(record);
      if (visible && !map.hasLayer(record.marker)) record.marker.addTo(map);
      if (!visible && map.hasLayer(record.marker)) record.marker.removeFrom(map);
    });

    updateMapCount(matches.length);

    if (searchResults) {
      searchResults.innerHTML = query
        ? matches.slice(0, 6).map(record => `
            <button type="button" data-map-result="${markerRecords.indexOf(record)}">
              <i class="fas ${record.category.icon}" aria-hidden="true"></i>
              <span><strong>${record.location.name}</strong><small>${record.category.label}</small></span>
              <i class="fas fa-arrow-right" aria-hidden="true"></i>
            </button>
          `).join("") || '<p>Nu am găsit acest loc pe hartă.</p>'
        : "";
      searchResults.classList.toggle("is-visible", Boolean(query));
    }

    return matches;
  };

  searchInput?.addEventListener("input", applyMapFilters);

  searchResults?.addEventListener("click", event => {
    const resultButton = event.target.closest("[data-map-result]");
    if (!resultButton) return;
    const record = markerRecords[Number(resultButton.dataset.mapResult)];
    if (record) showMarkerRecord(record);
  });

  legendItems.forEach(item => {
    const categoryClass = [...item.classList].find(className =>
      className.startsWith("community-map__legend-item--")
    );
    const categoryName = categoryClass?.replace("community-map__legend-item--", "");
    if (!categoryName) return;

    item.dataset.category = categoryName;
    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");
    item.setAttribute("aria-pressed", "false");
    item.setAttribute("title", "Filtrează harta");

    const selectCategory = () => {
      activeMapCategory = activeMapCategory === categoryName ? "all" : categoryName;
      legendItems.forEach(otherItem => {
        const selected = otherItem.dataset.category === activeMapCategory;
        otherItem.classList.toggle("is-active", selected);
        otherItem.setAttribute("aria-pressed", String(selected));
      });
      const matches = applyMapFilters();
      if (matches.length) {
        map.fitBounds(L.latLngBounds(matches.map(record => [record.location.lat, record.location.lng])), {
          padding: [55, 55],
          maxZoom: 14
        });
      }
    };

    item.addEventListener("click", selectCategory);
    item.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectCategory();
      }
    });
  });

  resetViewButton?.addEventListener("click", () => {
    activeMapCategory = "all";
    if (searchInput) searchInput.value = "";
    legendItems.forEach(item => {
      item.classList.remove("is-active");
      item.setAttribute("aria-pressed", "false");
    });
    applyMapFilters();
    map.closePopup();
    if (bustuchinBoundary?.getBounds().isValid()) {
      map.fitBounds(bustuchinBoundary.getBounds(), { padding: [35, 35], maxZoom: 13 });
    } else {
      fitMapToPins();
    }
  });

  updateMapCount(markerRecords.length);


  /* =======================================================
     NAVIGARE DIN POPUP + PAGE TRANSITION
  ======================================================= */

  mapElement.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
          ".map-popup__button"
        );


      if (!button) {
        return;
      }


      const targetId =
        button.dataset.mapTarget;


      if (!targetId) {
        return;
      }


      const target =
        document.getElementById(
          targetId
        );


      if (!target) {

        console.warn(
          `Secțiunea #${targetId} nu există în HTML.`
        );

        return;

      }


      /* ===================================================
         ÎNCHIDE POPUP
      =================================================== */

      map.closePopup();
      window.navigateBustuchinToHash?.(`#${targetId}`);

    }
  );


  /* =======================================================
     ÎNCADRAREA HĂRȚII
  ======================================================= */

  function fitMapToPins() {

    if (!markerCoordinates.length) {
      return;
    }


    const bounds =
      L.latLngBounds(
        markerCoordinates
      );


    map.fitBounds(
      bounds,
      {

        padding:
          [45, 45],

        maxZoom:
          14

      }
    );

  }


  /* =======================================================
     ÎNTÂI ARĂTĂM PINII
  ======================================================= */

  fitMapToPins();


  /* =======================================================
     APOI ÎNCĂRCĂM HOTARUL OFICIAL
  ======================================================= */

  const boundary =
    await loadBustuchinBoundary();


  /* =======================================================
     DACĂ HOTARUL EXISTĂ,
     ÎNCADREAZĂ ÎNTREAGA COMUNĂ
  ======================================================= */

  if (
    boundary &&
    boundary.getBounds().isValid()
  ) {

    map.fitBounds(
      boundary.getBounds(),
      {

        paddingTopLeft:
          [35, 55],

        paddingBottomRight:
          [35, 70],

        maxZoom:
          13

      }
    );

  }


  /* =======================================================
     FIX LEAFLET DUPĂ REVEAL
  ======================================================= */

  setTimeout(
    () => {

      map.invalidateSize();


      if (
        bustuchinBoundary &&
        bustuchinBoundary.getBounds().isValid()
      ) {

        map.fitBounds(
          bustuchinBoundary.getBounds(),
          {

            padding:
              [35, 35],

            maxZoom:
              13

          }
        );

      }

    },

    350

  );


  /* =======================================================
     CÂND HARTA INTRĂ ÎN VIEWPORT
  ======================================================= */

  const mapObserver =
    new IntersectionObserver(
      entries => {

        entries.forEach(
          entry => {

            if (!entry.isIntersecting) {
              return;
            }


            setTimeout(
              () => {

                map.invalidateSize();

              },

              150
            );

          }
        );

      },
      {

        threshold:
          0.1

      }
    );


  mapObserver.observe(
    mapElement
  );


  /* =======================================================
     RESIZE
  ======================================================= */

  let resizeTimer;


  window.addEventListener(
    "resize",
    () => {

      clearTimeout(
        resizeTimer
      );


      resizeTimer =
        setTimeout(
          () => {

            map.invalidateSize();

          },

          150
        );

    }
  );


  /* Explicit activation keeps page scrolling available over the map. */
  const activateButton = document.getElementById("mapActivate");
  const deactivateButton = document.getElementById("mapDeactivate");
  const activationCover = document.getElementById("mapActivationCover");
  const interaction = document.getElementById("mapInteraction");
  const interactionHandlers = ["dragging", "touchZoom", "doubleClickZoom", "scrollWheelZoom", "boxZoom", "keyboard", "tapHold"];

  const setMapActive = active => {
    interactionHandlers.forEach(name => map[name]?.[active ? "enable" : "disable"]());
    mapElement.inert = !active;
    interaction.classList.toggle("is-active", active);
    activationCover.hidden = active;
    deactivateButton.hidden = !active;
    if (active) {
      map.invalidateSize();
      mapElement.focus({ preventScroll: true });
    } else {
      map.closePopup();
      activateButton.focus({ preventScroll: true });
    }
  };

  activateButton.addEventListener("click", () => setMapActive(true));
  deactivateButton.addEventListener("click", () => setMapActive(false));
  interaction.addEventListener("keydown", event => {
    if (event.key === "Escape" && interaction.classList.contains("is-active")) {
      event.preventDefault();
      setMapActive(false);
    }
  });

}


/* =========================================================
   PORNIRE HARTĂ
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  initBustuchinMap
);








