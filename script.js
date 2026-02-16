/**
 * GIGANTIC WIT - PLATINUM ENGINE
 * Developer: Abdul Rahman
 */

// Global Variables
const editor = document.getElementById('editor');
const statusBadge = document.getElementById('save-status');
const storageFill = document.getElementById('storage-fill');
const storageText = document.getElementById('storage-text');

// --- 1. Text Formatting System ---
function format(cmd, val = null) {
    document.execCommand(cmd, false, val);
    editor.focus();
}

// --- 2. Application Logic Controller ---
const app = {
    // Theme Switcher
    toggleTheme: () => {
        document.body.classList.toggle('dark-theme');
        document.body.classList.toggle('light-theme');
        const theme = document.body.classList.contains('dark-theme') ? 'Dark' : 'Light';
        localStorage.setItem('gw_theme', theme);
    },

    // PDF Export
    exportPDF: () => {
        const opt = {
            margin: 0.5,
            filename: `GiganticWit_${new Date().toISOString().slice(0,10)}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(editor).save();
    },

    // New File
    newFile: () => {
        if(confirm("Create new document? Unsaved changes are auto-saved locally.")) {
            editor.innerHTML = "";
            app.updateStats();
        }
    },

    // Clear Data
    clearAll: () => {
        if(confirm("WARNING: Delete all data permanently?")) {
            localStorage.removeItem('gw_content');
            location.reload();
        }
    },

    // Update Stats (Word/Char Count & Storage)
    updateStats: () => {
        const text = editor.innerText || "";
        const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
        document.getElementById('word-count').innerText = words;
        document.getElementById('char-count').innerText = text.length;

        // Simulate Storage Usage
        const size = new Blob([editor.innerHTML]).size;
        const max = 5000000; // 5MB approx
        const pct = ((size / max) * 100).toFixed(2);
        storageFill.style.width = `${pct}%`;
        storageText.innerText = `Storage: ${pct}% used`;
    }
};

// --- 3. Auto Save Engine ---
let saveTimer;
editor.addEventListener('input', () => {
    statusBadge.classList.remove('visible');
    app.updateStats();
    
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
        localStorage.setItem('gw_content', editor.innerHTML);
        statusBadge.innerHTML = '<i class="fas fa-check-circle"></i> Saved';
        statusBadge.classList.add('visible');
    }, 1000);
});

// --- 4. OCR (Image to Text) Integration ---
const ocrInput = document.getElementById('ocr-upload');
ocrInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if(!file) return;

    const originalText = editor.innerHTML;
    editor.innerHTML += `<div style="color:blue; font-style:italic;">[Scanning Image... Please Wait]</div>`;

    try {
        const worker = await Tesseract.createWorker();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const { data: { text } } = await worker.recognize(file);
        
        // Remove loading text
        editor.innerHTML = originalText + `<br><hr><p><strong>[Extracted Text]:</strong> ${text}</p>`;
        await worker.terminate();
        app.updateStats();
        
    } catch (err) {
        alert("OCR Failed: " + err);
        editor.innerHTML = originalText;
    }
});

// --- 5. Initialization ---
window.onload = () => {
    // Load Content
    const savedContent = localStorage.getItem('gw_content');
    if(savedContent) editor.innerHTML = savedContent;

    // Load Theme
    const savedTheme = localStorage.getItem('gw_theme');
    if(savedTheme === 'Dark') document.body.classList.add('dark-theme');
    
    app.updateStats();
    console.log("Gigantic Wit Platinum Loaded.");
};
