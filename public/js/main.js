const communityAnnouncements = [
  {
    title: 'Weekly Game Night',
    text: 'Bergabung di Senin malam setiap minggu untuk bermain dan reuni komunitas bersama teman-teman Roblox.'
  },
  {
    title: 'Challenge Mingguan',
    text: 'Dapatkan badge spesial dengan menyelesaikan komunitas challenge yang baru setiap Sabtu.'
  },
  {
    title: 'Spotlight Anggota',
    text: 'Setiap minggu kami menyorot anggota aktif dan kontribusinya di server Discord.'
  }
];

const nextEvent = {
  title: 'Friday Watch Party',
  date: '2026-12-20T19:00:00',
  description: 'Nonton konten Roblox bersama komunitas dan ngobrol langsung di voice channel.'
};

let announcementIndex = 0;
let config = {};

function fetchConfig() {
  return fetch('/api/config')
    .then(res => res.json())
    .then(data => {
      config = data;
      updatePageConfig();
    })
    .catch(err => console.error('Failed to fetch config:', err));
}

function updatePageConfig() {
  document.querySelectorAll('#companyName, #footerCompany').forEach(el => {
    el.textContent = config.companyName || 'Ultras';
  });

  document.querySelectorAll('#discordLink').forEach(el => {
    el.href = config.discordInvite || '#';
    el.textContent = config.discordInvite || 'Loading...';
  });

  const discordButtons = document.querySelectorAll('#discordButtonContact');
  discordButtons.forEach(el => {
    el.href = config.discordInvite || '#';
  });

  document.querySelectorAll('#discordMeta').forEach(el => {
    el.textContent = config.discordInvite || 'Loading...';
  });

  document.getElementById('year').textContent = new Date().getFullYear();
}

function insertAnnouncementBar() {
  const banner = document.getElementById('announcementBar');
  if (!banner) return;

  const item = communityAnnouncements[announcementIndex];
  banner.innerHTML = `
    <div>
      <span class="announcement-badge">Community Spotlight</span>
      <strong>${item.title}</strong>
      <p>${item.text}</p>
    </div>
    <button id="copyDiscordBtn">Copy Discord Invite</button>
  `;

  const copyButton = document.getElementById('copyDiscordBtn');
  if (copyButton) copyButton.addEventListener('click', handleCopyInvite);

  announcementIndex = (announcementIndex + 1) % communityAnnouncements.length;
}

function insertEventCountdown() {
  const countdownBox = document.getElementById('nextEventBanner');
  if (!countdownBox) return;

  const eventDate = new Date(nextEvent.date);
  const now = new Date();
  const diff = eventDate - now;
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  const hours = Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24));
  const minutes = Math.max(0, Math.floor((diff / (1000 * 60)) % 60));

  countdownBox.innerHTML = `
    <div class="announcement-bar">
      <div>
        <span class="announcement-badge">Next Event</span>
        <strong>${nextEvent.title}</strong>
        <p>${nextEvent.description}</p>
        <p class="countdown-text">Dimulai dalam: ${days} hari ${hours} jam ${minutes} menit.</p>
      </div>
      <button id="copyDiscordBtn">Join Discord</button>
    </div>
  `;

  const copyButton = document.getElementById('copyDiscordBtn');
  if (copyButton) copyButton.addEventListener('click', handleCopyInvite);
}

function handleCopyInvite() {
  if (!navigator.clipboard) {
    alert('Clipboard tidak didukung di browser Anda. Silakan salin link secara manual.');
    return;
  }

  const invite = config.discordInvite || '';
  navigator.clipboard.writeText(invite)
    .then(() => alert('Link Discord berhasil disalin!'))
    .catch(() => alert('Gagal menyalin link. Silakan salin secara manual.'));
}

async function loadPage(path) {
  const page = pages[path] || pages['/'];
  const url = `/${page}.html`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const mainContent = doc.querySelector('main') || doc.body;

    const appEl = document.getElementById('app');
    if (appEl) {
      appEl.innerHTML = mainContent.innerHTML;
    }

    attachEventListeners();
    updatePageConfig();
    insertAnnouncementBar();
    insertEventCountdown();
    window.scrollTo(0, 0);
  } catch (err) {
    console.error('Error loading page:', err);
    const appEl = document.getElementById('app');
    if (appEl) appEl.innerHTML = '<p>Error loading page</p>';
  }
}

const pages = {
  '/': 'index',
  '/about': 'about',
  '/services': 'services',
  '/portfolio': 'portfolio',
  '/events': 'events',
  '/contact': 'contact'
};

document.addEventListener('click', (e) => {
  if (e.target.tagName === 'A' && e.target.href.startsWith(window.location.origin)) {
    e.preventDefault();
    const path = e.target.pathname;
    if (pages[path] !== undefined) {
      window.history.pushState({}, '', path);
      loadPage(path);
    } else {
      window.location.href = e.target.href;
    }
  }
});

window.addEventListener('popstate', () => {
  loadPage(window.location.pathname);
});

function attachEventListeners() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const name = form.elements['name'] ? form.elements['name'].value : '';
    const email = form.elements['email'] ? form.elements['email'].value : '';
    const message = form.elements['message'] ? form.elements['message'].value : '';

    if (!name || !email || !message) {
      alert('Semua field harus diisi');
      return;
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      const data = await res.json();
      if (data && data.success) {
        const existing = document.querySelector('.success');
        if (existing) existing.remove();
        const p = document.createElement('p');
        p.className = 'success';
        p.textContent = `Terima kasih, ${name} — permintaan gabungmu sudah diterima.`;
        form.parentNode.insertBefore(p, form);
        form.reset();
      }
    } catch (err) {
      console.error('Failed to submit form', err);
    }
  });
}

function initRouter() {
  fetchConfig().then(() => {
    const initialPath = window.location.pathname;
    if (pages[initialPath] !== undefined) {
      loadPage(initialPath);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  attachEventListeners();
  initRouter();
});