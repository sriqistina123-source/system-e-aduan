// ========== FIREBASE CONFIG ==========
// db dah initialize dalam HTML

// Global variable untuk simpan aduan
let aduanList = [];

// ========== STAFF DIREKTORI (GLOBAL) ==========
const staffDirektori = [
    { 
        id: 1,
        nama: 'Encik Wan Mohd Faris bin Wan Razali', 
        jawatan: 'Pembantu Keselamatan', 
        telefon: '013-950 5396', 
        gambar: "images/faris3.png"
    }
];

// ========== LOAD DATA FROM FIREBASE ==========
async function loadAduan() {
    try {
        const snapshot = await db.collection('aduan').orderBy('tarikh', 'desc').get();
        const aduan = [];
        snapshot.forEach(doc => {
            aduan.push({ id: doc.id, ...doc.data() });
        });
        return aduan;
    } catch (error) {
        console.error('Error loading aduan:', error);
        return [];
    }
}

// ========== SAVE TO FIREBASE ==========
async function saveAduanToFirebase(aduan) {
    try {
        const docRef = await db.collection('aduan').add(aduan);
        return docRef.id;
    } catch (error) {
        console.error('Error saving aduan:', error);
        throw error;
    }
}

// ========== DELETE FROM FIREBASE ==========
async function deleteAduanFromFirebase(id) {
    try {
        await db.collection('aduan').doc(id).delete();
    } catch (error) {
        console.error('Error deleting aduan:', error);
        throw error;
    }
}

// ========== UPDATE STATUS ==========
async function updateAduanStatus(id, selesai) {
    try {
        await db.collection('aduan').doc(id).update({ selesai: selesai });
    } catch (error) {
        console.error('Error updating aduan:', error);
        throw error;
    }
}

// Load data masa mula
loadAduan().then(data => {
    aduanList = data;
    // Refresh current page kalau perlu
    const currentPage = document.querySelector('.sidebar-item.active')?.dataset.page;
    if (currentPage) renderPage(currentPage);
});

// ========== LOGIN SYSTEM ==========
function checkLogin() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userType = localStorage.getItem('userType');
    const userEmail = localStorage.getItem('userEmail');
    const lastPage = localStorage.getItem('lastPage') || 'home';
    
    if (isLoggedIn === 'true') {
        showApp(userType, userEmail);
        setTimeout(() => {
            setActivePage(lastPage);
        }, 100);
    } else {
        showLogin();
    }
}

function showLogin() {
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('appContainer').style.display = 'none';
}

function showApp(userType, userEmail) {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('appContainer').style.display = 'flex';
    
    const userDisplay = document.getElementById('userDisplay');
    const userBadge = document.getElementById('userBadge');
    
    if (userType === 'admin') {
        userDisplay.innerHTML = `<strong>Admin MOH</strong> (${userEmail})`;
        userBadge.innerHTML = '<i class="fas fa-shield-alt"></i> Admin';
        updateSidebarForAdmin();
        updateBottomNavForAdmin();
    } else {
        userDisplay.innerHTML = `<strong>User MOH</strong> (${userEmail})`;
        userBadge.innerHTML = '<i class="fas fa-user"></i> User';
        updateSidebarForUser();
        updateBottomNavForUser();
    }
}

function updateSidebarForAdmin() {
    const sidebarMenu = document.querySelector('.sidebar-menu');
    sidebarMenu.innerHTML = `
        <div class="sidebar-item" data-page="home">
            <i class="fas fa-home"></i>
            <span>Home</span>
        </div>
        <div class="sidebar-item" data-page="aduan">
            <i class="fas fa-pen-alt"></i>
            <span>Aduan</span>
        </div>
        <div class="sidebar-item" data-page="status">
            <i class="fas fa-check-circle"></i>
            <span>Status</span>
        </div>
        <div class="sidebar-item" data-page="direktori">
            <i class="fas fa-address-book"></i>
            <span>Direktori</span>
        </div>
    `;
    refreshSidebarListeners();
}

function updateSidebarForUser() {
    const sidebarMenu = document.querySelector('.sidebar-menu');
    sidebarMenu.innerHTML = `
        <div class="sidebar-item" data-page="home">
            <i class="fas fa-home"></i>
            <span>Home</span>
        </div>
        <div class="sidebar-item" data-page="aduan">
            <i class="fas fa-pen-alt"></i>
            <span>Aduan</span>
        </div>
        <div class="sidebar-item" data-page="direktori">
            <i class="fas fa-address-book"></i>
            <span>Direktori</span>
        </div>
    `;
    refreshSidebarListeners();
}

function updateBottomNavForAdmin() {
    const bottomNav = document.querySelector('.bottom-nav');
    bottomNav.innerHTML = `
        <button class="nav-item" data-page="aduan">
            <i class="fas fa-pen-alt"></i>
            <span>Aduan</span>
        </button>
        <button class="nav-item" data-page="status">
            <i class="fas fa-check-circle"></i>
            <span>Status</span>
        </button>
    `;
    refreshNavListeners();
}

function updateBottomNavForUser() {
    const bottomNav = document.querySelector('.bottom-nav');
    bottomNav.innerHTML = `
        <button class="nav-item" data-page="home">
            <i class="fas fa-home"></i>
            <span>Home</span>
        </button>
        <button class="nav-item" data-page="aduan">
            <i class="fas fa-pen-alt"></i>
            <span>Aduan</span>
        </button>
    `;
    refreshNavListeners();
}

function refreshSidebarListeners() {
    const newSidebarItems = document.querySelectorAll('.sidebar-item');
    newSidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            setActivePage(page);
        });
    });
}

function refreshNavListeners() {
    const newNavItems = document.querySelectorAll('.nav-item');
    newNavItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            setActivePage(page);
        });
    });
}

// MOH login
document.getElementById('mohLoginBtn').addEventListener('click', function() {
    const email = document.getElementById('mohEmail').value.trim();
    const password = document.getElementById('mohPassword').value;
    
    if (!email || !password) {
        alert('Sila masukkan email dan password');
        return;
    }
    
    if (!email.includes('@moh.gov.my')) {
        alert('Email MOH mesti berakhir dengan @moh.gov.my');
        return;
    }
    
    let userType = '';
    if (password === 'admin123') {
        userType = 'admin';
    } else if (password === 'user123') {
        userType = 'user';
    } else {
        alert('Kata Laluan tidak tepat!');
        return;
    }
    
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userType', userType);
    localStorage.setItem('userEmail', email);
    
    showApp(userType, email);
    setActivePage('home');
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userType');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('lastPage');
    showLogin();
    document.getElementById('mohEmail').value = '';
    document.getElementById('mohPassword').value = '';
});

// DOM elements
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menuBtn');
const closeBtn = document.getElementById('closeSidebar');
const overlay = document.getElementById('overlay');
let sidebarItems = document.querySelectorAll('.sidebar-item');
let navItems = document.querySelectorAll('.nav-item');
const content = document.getElementById('content');
const pageTitle = document.getElementById('pageTitle');

// Toggle sidebar
function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('active');
}

function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
}

menuBtn.addEventListener('click', openSidebar);
closeBtn.addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);

// Navigation
function setActivePage(page) {
    localStorage.setItem('lastPage', page);
    
    sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        if(item.dataset.page === page) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if(item.dataset.page === page) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    if (page === 'home') pageTitle.textContent = 'Home';
    else if (page === 'aduan') pageTitle.textContent = 'Aduan';
    else if (page === 'status') pageTitle.textContent = 'Status';
    else if (page === 'direktori') pageTitle.textContent = 'Direktori';

    renderPage(page);

    if (window.innerWidth <= 768) {
        closeSidebar();
    }
}

// Render functions
function renderPage(page) {
    const userType = localStorage.getItem('userType');
    
    if (page === 'home') renderHome(userType);
    else if (page === 'aduan') renderAduan(userType);
    else if (page === 'status') renderStatus();
    else if (page === 'direktori') renderDirektori();
}

// ========== HOME PAGE ==========
function renderHome(userType) {
    let html = `
        <div class="home-container">
            <div class="home-header-card">
                <div class="header-background">
                    <img src="images/newlogohosp.jpeg" alt="Hospital Banting">
                    <div class="header-overlay"></div>
                </div>
                <div class="header-content">
                    <div class="profile-section">
                        <div class="profile-image">
                            <img src="images/profile uk4.png" alt="Hospital Icon">
                        </div>
                    </div>
                </div>
            </div>
    `;
    
    if (userType === 'admin') {
        html += `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon blue">
                        <i class="fas fa-pen-alt"></i>
                    </div>
                    <div class="stat-details">
                        <span class="stat-value">${aduanList.length}</span>
                        <span class="stat-label">Jumlah Aduan</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-details">
                        <span class="stat-value">${aduanList.filter(a => a.selesai).length}</span>
                        <span class="stat-label">Selesai</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon orange">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-details">
                        <span class="stat-value">${aduanList.filter(a => !a.selesai).length}</span>
                        <span class="stat-label">Dalam Proses</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon purple">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-details">
                        <span class="stat-value">${staffDirektori.length}</span>
                        <span class="stat-label">Staf Keselamatan</span>
                    </div>
                </div>
            </div>
            <div class="recent-section">
                <div class="section-header">
                    <h3>Aduan Terkini</h3>
                    <button class="view-all" onclick="setActivePage('aduan')">Lihat Semua <i class="fas fa-arrow-right"></i></button>
                </div>
                <div class="recent-list">
                    ${aduanList.slice(0, 3).map(a => `
                        <div class="recent-item">
                            <div class="recent-icon ${a.selesai ? 'completed' : 'pending'}">
                                <i class="fas ${a.selesai ? 'fa-check' : 'fa-clock'}"></i>
                            </div>
                            <div class="recent-details">
                                <h4>${a.jenis}</h4>
                                <p><i class="fas fa-user"></i> ${a.nama} • <i class="fas fa-map-marker-alt"></i> ${a.lokasi}</p>
                                <small><i class="fas fa-calendar"></i> ${a.tarikh} ${a.masa}</small>
                            </div>
                            <span class="recent-status ${a.selesai ? 'completed' : 'pending'}">
                                ${a.selesai ? 'Selesai' : 'Proses'}
                            </span>
                        </div>
                    `).join('')}
                    ${aduanList.length === 0 ? '<p style="text-align: center; color: #999; padding: 20px;">Tiada aduan buat masa ini</p>' : ''}
                </div>
            </div>
        `;
    } else {
        html += `
            <div class="quick-actions">
                <h3>Tindakan Pantas</h3>
                <div class="action-buttons">
                    <button class="action-btn" onclick="setActivePage('aduan')">
                        <i class="fas fa-plus-circle"></i>
                        <span>Buat Aduan</span>
                    </button>
                    <button class="action-btn" onclick="setActivePage('direktori')">
                        <i class="fas fa-address-book"></i>
                        <span>Hubungi Staf</span>
                    </button>
                </div>
            </div>
        `;
    }
    
    html += `</div>`;
    content.innerHTML = html;
}

// ========== ADUAN PAGE ==========
function renderAduan(userType) {
    let html = '';
    
    // USER boleh buat aduan baru
    if (userType === 'user') {
        html += `
            <div class="card">
                <h2>📝 Buat Aduan Baru</h2>
                <form id="formAduan">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Tarikh</label>
                            <input type="date" id="tarikh" required>
                        </div>
                        <div class="form-group">
                            <label>Masa</label>
                            <input type="time" id="masa" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Nama</label>
                        <input type="text" id="nama" placeholder="Nama penuh" required>
                    </div>
                    <div class="form-group">
                        <label>Jenis Aduan</label>
                        <input type="text" id="jenis" placeholder="Contoh: Kerosakan, Kebersihan, Keselamatan" required>
                    </div>
                    <div class="form-group">
                        <label>Lokasi</label>
                        <input type="text" id="lokasi" placeholder="Contoh: Blok B, Tingkat 2" required>
                    </div>
                    <div class="form-group">
                        <label>Gambar Bukti</label>
                        <div class="image-upload-area" id="uploadArea">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>Klik untuk upload gambar</p>
                            <small>JPG, PNG, GIF (Max 5MB)</small>
                            <input type="file" id="gambar" accept="image/*">
                        </div>
                        <div class="preview-container">
                            <img id="preview" class="image-preview" alt="Preview">
                            <button type="button" class="remove-image" id="removeImage">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Catatan</label>
                        <textarea id="catatan" rows="4" placeholder="Terangkan secara ringkas..."></textarea>
                    </div>
                    <button type="submit" class="btn-primary">
                        <i class="fas fa-paper-plane"></i> Hantar Aduan
                    </button>
                </form>
            </div>
        `;
    }
    
    html += `
        <div class="card">
            <h2>📋 Senarai Aduan</h2>
            <div class="aduan-list" id="senaraiAduan"></div>
        </div>
    `;

    content.innerHTML = html;

    // Image upload preview untuk USER
    if (userType === 'user') {
        const gambarInput = document.getElementById('gambar');
        const preview = document.getElementById('preview');
        const removeBtn = document.getElementById('removeImage');

        if (gambarInput) {
            gambarInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if(file) {
                    if(file.size > 5 * 1024 * 1024) {
                        alert('Gambar terlalu besar! Maksimum 5MB');
                        this.value = '';
                        return;
                    }
                    
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        preview.src = e.target.result;
                        preview.classList.add('show');
                        removeBtn.classList.add('show');
                    }
                    reader.readAsDataURL(file);
                }
            });
        }

        if (removeBtn) {
            removeBtn.addEventListener('click', function() {
                gambarInput.value = '';
                preview.src = '';
                preview.classList.remove('show');
                removeBtn.classList.remove('show');
            });
        }
    }

    async function refreshSenarai() {
        const senaraiDiv = document.getElementById('senaraiAduan');
        if (!senaraiDiv) return;
        
        // Load fresh data dari Firebase
        aduanList = await loadAduan();
        
        if (aduanList.length === 0) {
            senaraiDiv.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Tiada aduan buat masa ini</p>';
            return;
        }

        senaraiDiv.innerHTML = aduanList.map(aduan => `
            <div class="aduan-item">
                <div class="aduan-header">
                    <span class="aduan-nama">${aduan.nama}</span>
                    <span class="aduan-tarikh">${aduan.tarikh} ${aduan.masa}</span>
                    ${userType === 'admin' ? `
                        <button class="delete-btn" onclick="deleteAduan('${aduan.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
                <div class="aduan-detail">
                    <span>Jenis:</span>
                    <span>${aduan.jenis}</span>
                    <span>Lokasi:</span>
                    <span>${aduan.lokasi}</span>
                    <span>Catatan:</span>
                    <span>${aduan.catatan}</span>
                </div>
                ${aduan.gambar ? `<img src="${aduan.gambar}" alt="Bukti" class="aduan-gambar">` : ''}
            </div>
        `).join('');
    }

    // Tunjuk loading dulu
    const senaraiDiv = document.getElementById('senaraiAduan');
    if (senaraiDiv) {
        senaraiDiv.innerHTML = '<p style="text-align: center; color: #999;">Memuatkan aduan...</p>';
    }
    
    // Then load data
    refreshSenarai();

    // Handle form submission untuk USER
    if (userType === 'user') {
        const form = document.getElementById('formAduan');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                // Feedback button - disable dan tukar teks
                const submitBtn = e.target.querySelector('.btn-primary');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '⏳ Menghantar...';
                submitBtn.disabled = true;
                
                try {
                    const gambarFile = document.getElementById('gambar').files[0];
                    
                    if(gambarFile) {
                        const reader = new FileReader();
                        reader.onload = async function(event) {
                            await saveAduan(event.target.result);
                        }
                        reader.readAsDataURL(gambarFile);
                    } else {
                        await saveAduan(null);
                    }

                    async function saveAduan(gambarData) {
                        const newAduan = {
                            tarikh: document.getElementById('tarikh').value,
                            masa: document.getElementById('masa').value,
                            nama: document.getElementById('nama').value,
                            jenis: document.getElementById('jenis').value,
                            lokasi: document.getElementById('lokasi').value,
                            gambar: gambarData,
                            catatan: document.getElementById('catatan').value,
                            selesai: false
                        };

                        await saveAduanToFirebase(newAduan);
                        
                        // Refresh list dengan data terkini
                        aduanList = await loadAduan();
                        refreshSenarai();
                        
                        e.target.reset();
                        
                        const preview = document.getElementById('preview');
                        const removeBtn = document.getElementById('removeImage');
                        
                        if (preview) {
                            preview.src = '';
                            preview.classList.remove('show');
                        }
                        if (removeBtn) {
                            removeBtn.classList.remove('show');
                        }
                        
                        // Notifikasi berjaya (bukan alert)
                        const notif = document.createElement('div');
                        notif.style.position = 'fixed';
                        notif.style.bottom = '20px';
                        notif.style.left = '50%';
                        notif.style.transform = 'translateX(-50%)';
                        notif.style.backgroundColor = '#10b981';
                        notif.style.color = 'white';
                        notif.style.padding = '12px 24px';
                        notif.style.borderRadius = '8px';
                        notif.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        notif.style.zIndex = '9999';
                        notif.style.fontWeight = '500';
                        notif.style.textAlign = 'center';
                        notif.style.maxWidth = '90%';
                        notif.innerHTML = '✅ Aduan berjaya dihantar!';
                        document.body.appendChild(notif);
                        
                        setTimeout(() => {
                            notif.style.opacity = '0';
                            notif.style.transition = 'opacity 0.5s';
                            setTimeout(() => {
                                document.body.removeChild(notif);
                            }, 500);
                        }, 3000);
                    }
                } catch (error) {
                    // Notifikasi error
                    const notif = document.createElement('div');
                    notif.style.position = 'fixed';
                    notif.style.bottom = '20px';
                    notif.style.left = '50%';
                    notif.style.transform = 'translateX(-50%)';
                    notif.style.backgroundColor = '#ef4444';
                    notif.style.color = 'white';
                    notif.style.padding = '12px 24px';
                    notif.style.borderRadius = '8px';
                    notif.style.zIndex = '9999';
                    notif.innerHTML = '❌ Gagal hantar aduan';
                    document.body.appendChild(notif);
                    
                    setTimeout(() => {
                        document.body.removeChild(notif);
                    }, 3000);
                } finally {
                    // Kembalikan button ke asal
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            });
        }
    }
}

// ========== STATUS PAGE ==========
function renderStatus() {
    const userType = localStorage.getItem('userType');
    
    const html = `
        <div class="card">
            <h2>✅ Status Penyelesaian Aduan</h2>
            <div class="status-container" id="statusContainer"></div>
        </div>
    `;

    content.innerHTML = html;

    async function refreshStatus() {
        const container = document.getElementById('statusContainer');
        if (!container) return;
        
        // Load fresh data dari Firebase
        aduanList = await loadAduan();
        
        if (aduanList.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Tiada aduan buat masa ini</p>';
            return;
        }

        container.innerHTML = aduanList.map(a => `
            <div class="status-item" data-id="${a.id}">
                <input type="checkbox" class="status-checkbox" ${a.selesai ? 'checked' : ''}>
                <div class="status-info">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <h4>${a.jenis} - ${a.lokasi}</h4>
                            <p><i class="fas fa-user"></i> ${a.nama}</p>
                            <p><i class="fas fa-calendar"></i> ${a.tarikh} ${a.masa}</p>
                            <p><i class="fas fa-comment"></i> ${a.catatan}</p>
                            <span class="status-badge ${a.selesai ? 'selesai' : 'belum'}">
                                ${a.selesai ? '✓ Selesai' : '⏳ Belum Selesai'}
                            </span>
                        </div>
                        ${userType === 'admin' ? `
                            <button class="delete-btn" onclick="deleteAduan('${a.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.status-checkbox').forEach(cb => {
            cb.addEventListener('change', async function() {
                const statusItem = this.closest('.status-item');
                const id = statusItem.dataset.id;
                const aduan = aduanList.find(a => a.id === id);
                if (aduan) {
                    await updateAduanStatus(id, this.checked);
                    // Refresh dengan data terkini
                    aduanList = await loadAduan();
                    refreshStatus();
                }
            });
        });
    }

    // Tunjuk loading dulu
    const container = document.getElementById('statusContainer');
    if (container) {
        container.innerHTML = '<p style="text-align: center; color: #999;">Memuatkan status...</p>';
    }
    
    refreshStatus();
}

// ========== DIREKTORI PAGE ==========
function renderDirektori() {
    let html = `
        <div class="card">
            <h2>📞 Direktori Staf Unit Keselamatan</h2>
            <div class="direktori-grid" id="direktoriGrid">
                ${staffDirektori.map(staf => `
                    <div class="staf-card">
                        <img src="${staf.gambar}" alt="${staf.nama}">
                        <h3>${staf.nama}</h3>
                        <p>${staf.jawatan}</p>
                        <p class="phone"><i class="fas fa-phone-alt"></i> ${staf.telefon}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    content.innerHTML = html;
}

// ========== DELETE ADUAN ==========
async function deleteAduan(id) {
    if (confirm('Adakah anda pasti mahu memadam aduan ini?')) {
        await deleteAduanFromFirebase(id);
        aduanList = await loadAduan();
        
        const currentPage = document.querySelector('.sidebar-item.active').dataset.page;
        renderPage(currentPage);
    }
}

// Check login status when page loads
checkLogin();