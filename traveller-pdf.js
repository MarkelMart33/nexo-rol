/* Opens the copy of the Traveller manual selected by the user. It stays in this browser's IndexedDB. */
(() => {
  const databaseName = 'nexo-local-library';
  const storeName = 'documents';
  const recordId = 'traveller-manual';
  let databasePromise;
  let manualFile = null;
  let manualUrl = '';
  let requestedPage = 1;

  const byId = id => document.getElementById(id);
  const status = (message, error = false) => {
    const element = byId('travellerPdfStatus');
    if (!element) return;
    element.textContent = message;
    element.classList.toggle('is-error', error);
  };

  function openDatabase() {
    if (databasePromise) return databasePromise;
    databasePromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('Este navegador no permite guardar el PDF localmente.'));
        return;
      }
      const request = indexedDB.open(databaseName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(storeName)) db.createObjectStore(storeName, { keyPath: 'id' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('No se pudo abrir el almacenamiento local.'));
    });
    return databasePromise;
  }

  function storeRequest(mode, action) {
    return openDatabase().then(db => new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, mode);
      const request = action(transaction.objectStore(storeName));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('No se pudo guardar el PDF.'));
      transaction.onabort = () => reject(transaction.error || new Error('No se pudo completar el guardado.'));
    }));
  }

  function setManual(file) {
    if (manualUrl) URL.revokeObjectURL(manualUrl);
    manualFile = file;
    manualUrl = file ? URL.createObjectURL(file) : '';
    byId('clearTravellerPdf').hidden = !file;
    if (file) status(`${file.name} · ${Math.ceil(file.size / 1024 / 1024)} MB · guardado solo en este navegador`);
  }

  function pageNumber(value) {
    const page = Number.parseInt(value, 10);
    return Number.isFinite(page) ? Math.min(211, Math.max(1, page)) : 1;
  }

  function showPage(value) {
    requestedPage = pageNumber(value);
    const viewer = byId('travellerPdfViewer');
    if (!manualFile || !manualUrl) {
      status('Selecciona tu copia del PDF. Después se abrirá esta página.');
      byId('travellerPdfInput').click();
      return;
    }
    const url = `${manualUrl}#page=${requestedPage}&zoom=page-width`;
    byId('travellerPdfPageLabel').textContent = `PDF · PÁGINA ${requestedPage} DE 211`;
    byId('travellerPdfFrame').src = url;
    byId('openTravellerPdfTab').href = url;
    viewer.hidden = false;
    viewer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function loadManual(file) {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLocaleLowerCase().endsWith('.pdf')) {
      status('Elige un archivo PDF para abrir el manual.', true);
      return;
    }
    status('GUARDANDO PDF EN ESTE DISPOSITIVO…');
    try {
      await storeRequest('readwrite', store => store.put({ id: recordId, name: file.name, size: file.size, file }));
      setManual(file);
      showPage(requestedPage);
    } catch (error) {
      status(error.message || 'No se pudo guardar el PDF. Prueba a abrirlo de nuevo.', true);
    }
  }

  async function removeManual() {
    if (!confirm('¿Quitar la copia local del PDF de este navegador?')) return;
    try {
      await storeRequest('readwrite', store => store.delete(recordId));
      setManual(null);
      byId('travellerPdfViewer').hidden = true;
      byId('travellerPdfFrame').removeAttribute('src');
      byId('openTravellerPdfTab').removeAttribute('href');
      status('PDF quitado. La copia original no se ha modificado.');
    } catch {
      status('No se pudo quitar el PDF del almacenamiento local.', true);
    }
  }

  async function restoreManual() {
    try {
      const record = await storeRequest('readonly', store => store.get(recordId));
      if (!record?.file) return;
      setManual(record.file);
    } catch {
      status('No se pudo recuperar el PDF guardado. Puedes volver a seleccionarlo.', true);
    }
  }

  function init() {
    byId('loadTravellerPdf').addEventListener('click', () => byId('travellerPdfInput').click());
    byId('travellerPdfInput').addEventListener('change', event => {
      loadManual(event.target.files?.[0]);
      event.target.value = '';
    });
    byId('clearTravellerPdf').addEventListener('click', removeManual);
    byId('closeTravellerPdf').addEventListener('click', () => { byId('travellerPdfViewer').hidden = true; });
    byId('travellerResults').addEventListener('click', event => {
      const button = event.target.closest('[data-pdf-page]');
      if (button) showPage(button.dataset.pdfPage);
    });
    restoreManual();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();

