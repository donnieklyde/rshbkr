(function () {
    // --- Configuration ---
    const API_ENDPOINT = '/api/hits'; // Assumes the script is hosted on the same domain or proxied

    // --- CSS Injection ---
    const style = document.createElement('style');
    style.textContent = `
    #rshbkr-counter {
      position: fixed;
      bottom: 12px;
      right: 12px;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      font-family: 'Bahnschrift', sans-serif;
      z-index: 99999;
      pointer-events: none;
      user-select: none;
    }
    .counter-unique {
      font-size: 14px;
      color: #888;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .counter-total {
      font-size: 11px;
      color: #444;
      margin-top: -2px;
    }
  `;
    document.head.appendChild(style);

    // --- HTML Injection ---
    const container = document.createElement('div');
    container.id = 'rshbkr-counter';
    container.innerHTML = `
    <div class="counter-unique" id="count-unique">...</div>
    <div class="counter-total" id="count-total">...</div>
  `;
    document.body.appendChild(container);

    // --- Identity Fingerprint ---
    function getFingerprint() {
        let id = localStorage.getItem('rshbkr_hw_id');
        if (!id) {
            id = Math.random().toString(36).substring(2) + Date.now().toString(36);
            localStorage.setItem('rshbkr_hw_id', id);
        }
        // Combine with some hardware-ish browser info
        const hw = [
            navigator.hardwareConcurrency,
            navigator.deviceMemory,
            screen.width + 'x' + screen.height,
            navigator.userAgent
        ].join('|');
        return id + '-' + btoa(hw).substring(0, 32);
    }

    // --- Interaction ---
    async function updateCounter() {
        try {
            const fingerprint = getFingerprint();
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fingerprint })
            });
            const data = await response.json();

            document.getElementById('count-unique').textContent = data.unique || '0';
            document.getElementById('count-total').textContent = data.total || '0';
        } catch (e) {
            console.warn('RSHBKR Counter failed:', e);
            // Fallback: hide if it fails
            container.style.display = 'none';
        }
    }

    // Start
    if (document.readyState === 'complete') {
        updateCounter();
    } else {
        window.addEventListener('load', updateCounter);
    }
})();
