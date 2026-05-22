// Fonction pour mettre à jour l'interface en direct
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

// Mettre à jour dès qu'on ouvre le popup
updatePopup();

// Écouter si une mise à jour survient pendant que le popup est ouvert
browser.storage.onChanged.addListener(updatePopup);