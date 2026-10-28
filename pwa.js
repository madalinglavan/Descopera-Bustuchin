(() => {
  "use strict";
  const buttons = Array.from(document.querySelectorAll("[data-install-app]"));
  const dialog = document.getElementById("installAppDialog");
  if (!buttons.length || !dialog) return;
  let installPrompt = null;
  let installing = false;
  let wasInstalled = false;
  let dialogTrigger = null;
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone = window.matchMedia("(display-mode: standalone)");
  const isInstalled = () => wasInstalled || standalone.matches || navigator.standalone === true;
  const updateButtons = () => {
    buttons.forEach(button => {
      button.hidden = isInstalled() || (button.classList.contains("nav-install") && !ios && !installPrompt);
      button.disabled = installing;
    });
  };
  const installed = () => {
    wasInstalled = true;
    updateButtons();
    if (dialog.open) dialog.close();
  };
  updateButtons();
  standalone.addEventListener("change", updateButtons);
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    installPrompt = event;
    updateButtons();
  });
  window.addEventListener("appinstalled", () => { installPrompt = null; installed(); });
  const requestInstall = async event => {
    if (isInstalled() || installing) return;
    if (!ios && installPrompt) {
      const prompt = installPrompt;
      installPrompt = null;
      installing = true;
      updateButtons();
      try {
        await prompt.prompt();
        const result = await prompt.userChoice;
        if (result.outcome === "accepted") installed();
        return;
      } catch (error) { console.warn("Instalarea nu a putut fi inițiată:", error); }
      finally { installing = false; updateButtons(); }
    }
    dialogTrigger = event.currentTarget;
    document.getElementById("installAppIOSSteps").hidden = !ios || !window.isSecureContext;
    document.getElementById("installAppInstructions").textContent = !window.isSecureContext
      ? "Instalarea este disponibilă pe versiunea publică a site-ului, printr-o conexiune HTTPS."
      : ios
        ? "Pe iPhone și iPad, adaugi monografia din meniul Safari. Urmează acești patru pași:"
        : "Din meniul browserului, caută Instalează aplicația sau Adaugă pe ecranul principal. Dacă opțiunea nu apare încă, reîncarcă pagina și încearcă din Chrome sau Edge. Disponibilitatea instalării depinde de browser.";
    dialog.showModal();
  };
  buttons.forEach(button => button.addEventListener("click", requestInstall));
  dialog.querySelector(".app-install-dialog__close").addEventListener("click", () => dialog.close());
  dialog.querySelector(".app-install-dialog__done").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => { if (dialogTrigger && !dialogTrigger.hidden) dialogTrigger.focus(); });
  dialog.addEventListener("click", event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  if ("serviceWorker" in navigator && window.isSecureContext) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(error => console.warn("Modul offline nu este disponibil:", error));
    });
  }
})();
