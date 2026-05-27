async function updatePopup() {
    const data = await browser.storage.local.get(['lastReal', 'lastDecoy', 'lastScore']);
    
    if (data.lastReal) {
        document.getElementById('real-activity').textContent = data.lastReal;
    }
    if (data.lastDecoy) {
        document.getElementById('decoy-activity').textContent = data.lastDecoy;
    }
    if (data.lastScore) {
        document.getElementById('decoy-score').textContent = `+ ${data.lastScore} sémantique`;
    }
}

updatePopup();

browser.storage.onChanged.addListener(updatePopup);