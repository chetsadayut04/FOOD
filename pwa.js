// ลงทะเบียน Service Worker สำหรับ PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => {
        console.log('PWA Service Worker registered:', reg.scope);
      })
      .catch((err) => {
        console.warn('PWA Service Worker failed:', err);
      });
  });
}

// ควบคุมปุ่มติดตั้งแอป (Install Prompt)
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  const installBtn = document.getElementById('pwaInstallBtn');
  if (installBtn) {
    installBtn.style.display = 'inline-flex';
    installBtn.onclick = async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        installBtn.style.display = 'none';
      }
      deferredPrompt = null;
    };
  }
});

// ซ่อนปุ่มเมื่อติดตั้งแอปเรียบร้อยแล้ว
window.addEventListener('appinstalled', () => {
  const installBtn = document.getElementById('pwaInstallBtn');
  if (installBtn) installBtn.style.display = 'none';
});

// ตรวจสอบสถานะถ้ากำลังเปิดจากตัวแอป (Standalone Mode)
window.addEventListener('DOMContentLoaded', () => {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const installBtn = document.getElementById('pwaInstallBtn');
  if (isStandalone && installBtn) {
    installBtn.style.display = 'none';
  }
});

