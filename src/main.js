// src/main.js

/**
 * SUPABASE CONFIGURATION
 */
const SUPABASE_URL = 'https://fcztinetziawzjrdsavk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_frqytbYXpEd05Z7x2mpAWg_og1nsQSa';

// Initialize Supabase
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// State
let currentView = 'dashboard'; // 'dashboard', 'favorites', 'trash'
let viewLayout = 'grid'; // 'grid', 'list'
let lastFetchedData = [];

// DOM Elements
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const dropZone = document.getElementById('dropZone');
const fileGrid = document.getElementById('fileGrid');
const loadingIndicator = document.getElementById('loading');
const emptyState = document.getElementById('emptyState');
const pageTitle = document.getElementById('page-title');
const pageSubtitle = document.getElementById('page-subtitle');
const storageBar = document.getElementById('storage-bar');
const storageText = document.getElementById('storage-text');

// Navigation Elements
const navDashboard = document.getElementById('nav-dashboard');
const navShared = document.getElementById('nav-shared');
const navRecent = document.getElementById('nav-recent');
const navFavorites = document.getElementById('nav-favorites');
const navTrash = document.getElementById('nav-trash');

// View Toggle Elements
const viewGridBtn = document.getElementById('view-grid');
const viewListBtn = document.getElementById('view-list');

// Modal Elements
const imageModal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalVideo = document.getElementById('modalVideo');
const modalTitle = document.getElementById('modalTitle');
const closeModalBtn = document.getElementById('closeModal');
const modalBackdrop = document.getElementById('modalBackdrop');

// Search Elements
const searchInput = document.getElementById('searchInput');

// --- Event Listeners ---

uploadBtn.addEventListener('click', (e) => {
    if (e.target !== fileInput) fileInput.click();
});

fileInput.addEventListener('change', handleFileSelect);

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
});

// Search Listener
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtereddata = lastFetchedData.filter(file => file.name.toLowerCase().includes(query));
    renderDocs(filtereddata);
});

// Navigation Listeners
navDashboard.addEventListener('click', (e) => { e.preventDefault(); switchView('dashboard'); });
navShared.addEventListener('click', (e) => { e.preventDefault(); switchView('shared'); });
navRecent.addEventListener('click', (e) => { e.preventDefault(); switchView('recent'); });
navFavorites.addEventListener('click', (e) => { e.preventDefault(); switchView('favorites'); });
navTrash.addEventListener('click', (e) => { e.preventDefault(); switchView('trash'); });

// View Toggle Listeners
viewGridBtn.addEventListener('click', () => switchLayout('grid'));
viewListBtn.addEventListener('click', () => switchLayout('list'));

// Modal Listeners
closeModalBtn.addEventListener('click', closeImageModal);
modalBackdrop.addEventListener('click', closeImageModal);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !imageModal.classList.contains('hidden')) {
        closeImageModal();
    }
});

// --- Core Functions ---

// --- View Functions ---

function openImageModal(url, title, type = 'image') {
    modalTitle.innerText = title;
    
    // Expanded regex for video formats
    const isVideo = type === 'video' || url.match(/\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv)$/i);

    if (isVideo) {
        modalImage.classList.add('hidden');
        modalVideo.classList.remove('hidden');
        modalVideo.src = url;
        modalVideo.play();
    } else {
        modalVideo.classList.add('hidden');
        modalImage.classList.remove('hidden');
        modalImage.src = url;
        // Pause video if it was playing
        modalVideo.pause();
        modalVideo.src = "";
    }
    
    imageModal.classList.remove('hidden');
    // Small delay to allow display:block to apply before opacity transition
    setTimeout(() => {
        imageModal.classList.remove('opacity-0');
    }, 10);
}

function closeImageModal() {
    imageModal.classList.add('opacity-0');
    setTimeout(() => {
        imageModal.classList.add('hidden');
        modalImage.src = '';
        modalVideo.pause();
        modalVideo.src = '';
    }, 300);
}

// --- Layout Functions ---
function switchLayout(mode) {
    viewLayout = mode;
    
    // Update Button Styles
    const activeClass = "p-1.5 rounded-md bg-white/10 text-white shadow-sm transition-all";
    const inactiveClass = "p-1.5 rounded-md text-gray-500 hover:text-white transition-colors";

    if (mode === 'grid') {
        viewGridBtn.className = activeClass;
        viewListBtn.className = inactiveClass;
    } else {
        viewGridBtn.className = inactiveClass;
        viewListBtn.className = activeClass;
    }

    // Re-render with cached data
    renderDocs(lastFetchedData);
}

function switchView(view) {
    currentView = view;
    
    // Update Active Nav State
    updateNavStyles(view);
    
    // Update Title
    if (view === 'dashboard') {
        pageTitle.innerText = 'Dashboard';
        pageSubtitle.innerText = 'All your active files';
    } else if (view === 'shared') {
        pageTitle.innerText = 'Shared';
        pageSubtitle.innerText = 'Files you have shared';
    } else if (view === 'recent') {
        pageTitle.innerText = 'Recent';
        pageSubtitle.innerText = 'Uploaded in the last 7 days';
    } else if (view === 'favorites') {
        pageTitle.innerText = 'Favorites';
        pageSubtitle.innerText = 'Your starred items';
    } else if (view === 'trash') {
        pageTitle.innerText = 'Trash';
        pageSubtitle.innerText = 'Items deleted recently';
    }

    fetchFiles();
}

function updateNavStyles(activeView) {
    const defaultClass = "flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer";
    const activeClass = "flex items-center gap-4 px-3 py-3 rounded-xl bg-white/10 text-neon-cyan border-l-2 border-neon-cyan cursor-pointer";
    
    navDashboard.className = activeView === 'dashboard' ? activeClass : defaultClass;
    navShared.className = activeView === 'shared' ? activeClass : defaultClass;
    navRecent.className = activeView === 'recent' ? activeClass : defaultClass;
    navFavorites.className = activeView === 'favorites' ? activeClass : defaultClass;
    navTrash.className = activeView === 'trash' ? activeClass : defaultClass;
}

function handleFileSelect(e) {
    if (e.target.files.length > 0) handleFiles(e.target.files);
}

function handleFiles(files) {
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
            uploadFileWithProgress(file);
        } else {
            console.warn(`Skipped ${file.name}: Not an image or video.`);
            Toast.show(`Skipped ${file.name}: Unsupported file type`, 'warning');
        }
    });
}

// Custom Alert System
window.Alert = {
    prompt: function(title, text, placeholder, onConfirm) {
        this.show({
            icon: 'question',
            title, text,
            showCancelButton: true,
            confirmButtonText: 'Save',
            cancelButtonText: 'Cancel',
            input: true,
            inputPlaceholder: placeholder,
            onConfirm: (inputValue) => onConfirm(inputValue)
        });
    },

    show: function(options) {
        const defaults = {
            title: '',
            text: '',
            icon: 'info',
            showCancelButton: false,
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            input: false,
            inputPlaceholder: '',
            onConfirm: null,
            onCancel: null
        };

        const config = { ...defaults, ...options };

        const existingAlert = document.getElementById('custom-alert');
        if (existingAlert) existingAlert.remove();

        const overlay = document.createElement('div');
        overlay.id = 'custom-alert';
        overlay.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in';

        const alertBox = document.createElement('div');
        alertBox.className = 'glass-card border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-slide-up ring-1 ring-white/5';

        const iconHTML = this.getIcon(config.icon);

        alertBox.innerHTML = `
            <div class="text-center">
                ${iconHTML}
                ${config.title ? `<h3 class="text-xl font-display font-bold text-white mb-2">${config.title}</h3>` : ''}
                ${config.text ? `<p class="text-gray-400 mb-6 text-sm leading-relaxed">${config.text}</p>` : ''}
                
                ${config.input ? `
                    <input type="text" id="alert-input" class="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-white mb-6 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all" placeholder="${config.inputPlaceholder}" value="">
                ` : ''}

                <div class="flex gap-3 justify-center">
                    ${config.showCancelButton ? `
                        <button id="alert-cancel" class="px-5 py-2.5 rounded-xl bg-dark-lighter hover:bg-white/10 text-gray-300 transition-colors font-medium text-sm">
                            ${config.cancelButtonText}
                        </button>
                    ` : ''}
                    <button id="alert-confirm" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple hover:from-cyan-400 hover:to-purple-400 text-black font-bold transition-all shadow-neon-cyan/20 text-sm">
                        ${config.confirmButtonText}
                    </button>
                </div>
            </div>
        `;

        overlay.appendChild(alertBox);
        document.body.appendChild(overlay);

        const confirmBtn = document.getElementById('alert-confirm');
        const cancelBtn = document.getElementById('alert-cancel');
        const inputField = document.getElementById('alert-input');

        if (inputField) inputField.focus();

        confirmBtn.addEventListener('click', () => {
            const value = inputField ? inputField.value : null;
            this.close();
            if (config.onConfirm) config.onConfirm(value);
        });

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.close();
                if (config.onCancel) config.onCancel();
            });
        }
    },
    
    getIcon: function(type) {
        const icons = {
            success: `<div class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 border border-green-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]"><span class="material-icons-outlined text-3xl text-green-400">check</span></div>`,
            error: `<div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.3)]"><span class="material-icons-outlined text-3xl text-red-500">priority_high</span></div>`,
            warning: `<div class="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/10 border border-yellow-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.3)]"><span class="material-icons-outlined text-3xl text-yellow-400">warning_amber</span></div>`,
            question: `<div class="w-16 h-16 mx-auto mb-4 rounded-full bg-neon-cyan/10 border border-neon-cyan/50 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]"><span class="material-icons-outlined text-3xl text-neon-cyan">question_mark</span></div>`,
            info: `<div class="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/10 border border-blue-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]"><span class="material-icons-outlined text-3xl text-blue-400">info</span></div>`
        };
        return icons[type] || icons.info;
    },

    close: function() {
        const alert = document.getElementById('custom-alert');
        if (alert) {
            alert.classList.add('animate-fade-out');
            setTimeout(() => alert.remove(), 200);
        }
    },

    success: function(title, text) { this.show({ icon: 'success', title, text, confirmButtonText: 'OK' }); },
    error: function(title, text) { this.show({ icon: 'error', title, text, confirmButtonText: 'OK' }); },
    confirm: function(title, text, onConfirm) {
        this.show({
            icon: 'question',
            title, text,
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel',
            onConfirm
        });
    }
};

window.Toast = {
    show: function(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `fixed top-6 right-6 z-[9999] glass-card border border-white/10 rounded-xl p-4 shadow-2xl max-w-sm animate-slide-up flex items-center gap-3 ring-1 ring-white/5`;

        const colors = { success: 'text-green-400', error: 'text-red-400', warning: 'text-yellow-400', info: 'text-neon-cyan' };
        const icons = { success: 'check_circle', error: 'error', warning: 'warning', info: 'info' };

        toast.innerHTML = `
            <span class="material-icons-outlined ${colors[type] || colors.info}">${icons[type] || icons.info}</span>
            <p class="text-white text-sm font-medium tracking-wide">${message}</p>
        `;

        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('animate-fade-out');
            setTimeout(() => toast.remove(), 200);
        }, duration);
    }
};

// --- Updated Core Functions ---

// --- Upload with Progress ---

function createProgressCard(file) {
    const id = 'progress-' + Math.random().toString(36).substr(2, 9);
    const container = document.getElementById('upload-progress-container');
    
    const card = document.createElement('div');
    card.id = id;
    card.className = 'upload-card';
    card.innerHTML = `
        <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-3 overflow-hidden">
                <span class="material-icons-outlined text-neon-cyan text-sm">${file.type.startsWith('video/') ? 'movie' : 'image'}</span>
                <span class="text-sm font-medium text-white truncate max-w-[150px]">${file.name}</span>
            </div>
            <span class="text-xs font-bold text-neon-cyan progress-text">0%</span>
        </div>
        <div class="progress-track">
            <div class="progress-fill" style="width: 0%"></div>
        </div>
    `;
    
    container.appendChild(card);
    return id;
}

function updateProgress(id, percent) {
    const card = document.getElementById(id);
    if (!card) return;
    
    const fill = card.querySelector('.progress-fill');
    const text = card.querySelector('.progress-text');
    
    fill.style.width = `${percent}%`;
    text.innerText = `${Math.round(percent)}%`;
}

function completeProgress(id, success = true) {
    const card = document.getElementById(id);
    if (!card) return;
    
    const fill = card.querySelector('.progress-fill');
    const text = card.querySelector('.progress-text');
    
    if (success) {
        fill.style.background = '#22c55e'; // Green
        text.innerText = 'Done';
        text.className = 'text-xs font-bold text-green-400';
    } else {
        fill.style.background = '#ef4444'; // Red
        text.innerText = 'Failed';
        text.className = 'text-xs font-bold text-red-500';
    }
    
    // Remove after delay
    setTimeout(() => {
        card.classList.add('animate-fade-out');
        setTimeout(() => card.remove(), 300);
    }, 3000);
}

async function uploadFileWithProgress(file) {
    const progressId = createProgressCard(file);
    
    // Get current session for authentication
    const { data: { session } } = await supabaseClient.auth.getSession();
    const token = session?.access_token || SUPABASE_KEY;

    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const uniqueName = `${timestamp}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    // Determine folder based on type
    const folder = file.type.startsWith('video/') ? 'videos' : 'images';
    const filePath = `${folder}/${uniqueName}`;
    
    // Using XMLHttpRequest for progress tracking
    const xhr = new XMLHttpRequest();
    const url = `${SUPABASE_URL}/storage/v1/object/gallery/${filePath}`;
    
    xhr.open('POST', url, true);
    
    // Headers
    xhr.setRequestHeader('apikey', SUPABASE_KEY);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('Content-Type', file.type);
    
    // x-upsert header might be needed depending on policy, generally false is safe for new files
    xhr.setRequestHeader('x-upsert', 'false');
    
    xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            updateProgress(progressId, percentComplete);
        }
    };
    
    xhr.onload = async () => {
        if (xhr.status === 200) {
            completeProgress(progressId, true);
            
            // Get Public URL
            const { data: { publicUrl } } = supabaseClient.storage.from('gallery').getPublicUrl(filePath);
            
            // Save to DB
            // Note: 'type' column doesn't exist in schema, so we rely on extension/mime inferred from name/storage_ref if needed.
            const { error: dbError } = await supabaseClient.from('images').insert([{ 
                name: file.name, 
                storage_ref: filePath, 
                url: publicUrl, 
                size: file.size, 
                is_shared: false
            }]);

            if (dbError) {
                console.error("Database Error:", dbError);
                Alert.error("Database Error", "Failed to save metadata.");
            } else {
                Toast.show("File uploaded successfully!", "success");
                fetchFiles(); // Refresh grid
                updateStorageUsage();
            }
            
        } else {
            console.error('Upload failed:', xhr.responseText);
            completeProgress(progressId, false);
            try {
                const response = JSON.parse(xhr.responseText);
                Alert.error("Upload Failed", response.message || "Server responded with error.");
            } catch (e) {
                Alert.error("Upload Failed", "Server responded with error: " + xhr.status);
            }
        }
    };
    
    xhr.onerror = () => {
        console.error('Upload error');
        completeProgress(progressId, false);
        Alert.error("Network Error", "Upload failed due to network issue.");
    };
    
    xhr.send(file);
}

// Deprecated original uploadFile - removed
// async function uploadFile(file) { ... }

async function fetchFiles() {
    loadingIndicator.style.display = 'block';
    
    let query = supabaseClient.from('images').select('*');

    // Apply Filters based on View
    if (currentView === 'dashboard') {
        query = query.eq('is_trashed', false);
    } else if (currentView === 'shared') {
        query = query.eq('is_trashed', false).eq('is_shared', true);
    } else if (currentView === 'recent') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        query = query.eq('is_trashed', false).gte('created_at', sevenDaysAgo.toISOString());
    } else if (currentView === 'favorites') {
        query = query.eq('is_trashed', false).eq('is_favorite', true);
    } else if (currentView === 'trash') {
        query = query.eq('is_trashed', true);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    loadingIndicator.style.display = 'none';

    if (error) {
        // If error due to missing column (before user updates schema), just show empty
        console.warn("Fetch error (possibly missing column):", error);
        if (currentView === 'shared' && error.code === '42703') { // Undefined column
             Alert.error("Configuration Needed", "Please run the 'add_shared_column.sql' script in Supabase.");
        }
        return;
    }

    lastFetchedData = data; // Cache data
    renderDocs(data);
}

function renderDocs(files) {
    fileGrid.innerHTML = '';
    
    if (!files || files.length === 0) {
        emptyState.classList.remove('hidden');
        emptyState.classList.add('flex');
    } else {
        emptyState.classList.add('hidden');
        emptyState.classList.remove('flex');
        
        // Update Grid Container Class based on Layout
        if (viewLayout === 'grid') {
            fileGrid.className = 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6';
        } else {
            fileGrid.className = 'flex flex-col gap-3';
        }

        files.forEach(file => {
            fileGrid.appendChild(createFileCard(file));
        });
    }
}

function createFileCard(data) {
    const div = document.createElement('div');
    const menuId = `menu-${data.id}`;
    
    // Icons
    const favIcon = data.is_favorite ? 'star' : 'star_border';
    const favColor = data.is_favorite ? 'text-yellow-400' : 'text-neon-cyan';
    const sharedIcon = data.is_shared ? 'share' : 'share';
    const sharedColor = data.is_shared ? 'text-neon-purple' : 'text-neon-cyan';
    
    // --- MENU ACTIONS ---
    const menuItems = `
        <button onclick="openImageModal('${data.url}', '${data.name}')" class="w-full text-left px-4 py-2 hover:bg-white/10 text-gray-300 hover:text-white flex items-center gap-2 transition-colors">
            <span class="material-icons-outlined text-sm text-neon-cyan">visibility</span> Preview
        </button>
        ${currentView !== 'trash' ? `
        <button onclick="shareImage(${data.id}, '${data.url}')" class="w-full text-left px-4 py-2 hover:bg-white/10 text-gray-300 hover:text-white flex items-center gap-2 transition-colors">
            <span class="material-icons-outlined text-sm ${sharedColor}">${sharedIcon}</span> Share
        </button>
        <button onclick="renameFile(${data.id}, '${data.name}')" class="w-full text-left px-4 py-2 hover:bg-white/10 text-gray-300 hover:text-white flex items-center gap-2 transition-colors">
            <span class="material-icons-outlined text-sm text-blue-400">edit</span> Rename
        </button>
        <button onclick="toggleFavorite(${data.id}, ${data.is_favorite})" class="w-full text-left px-4 py-2 hover:bg-white/10 text-gray-300 hover:text-white flex items-center gap-2 transition-colors">
            <span class="material-icons-outlined text-sm ${favColor}">${favIcon}</span> Favorite
        </button>
        <button onclick="moveToTrash(${data.id})" class="w-full text-left px-4 py-2 hover:bg-white/10 text-gray-300 hover:text-neon-pink flex items-center gap-2 transition-colors">
            <span class="material-icons-outlined text-sm text-neon-pink">delete</span> Move to Trash
        </button>
        ` : `
        <button onclick="restoreImage(${data.id})" class="w-full text-left px-4 py-2 hover:bg-white/10 text-gray-300 hover:text-green-400 flex items-center gap-2 transition-colors">
            <span class="material-icons-outlined text-sm text-green-400">replay</span> Restore
        </button>
        <button onclick="deletePermanently(${data.id}, '${data.storage_ref}')" class="w-full text-left px-4 py-2 hover:bg-white/10 text-gray-300 hover:text-red-500 flex items-center gap-2 transition-colors">
            <span class="material-icons-outlined text-sm text-red-500">delete_forever</span> Delete Permanently
        </button>
        `}
    `;

    // Dropdown Logic (Inline for simplicity, or bind globally)
    // Using a simple toggle logic attached to window for now or add listener
    window.toggleMenu = function(id, event) {
        event.stopPropagation();
        // Close all other menus
        document.querySelectorAll('.action-menu').forEach(menu => {
            if(menu.id !== `menu-${id}`) menu.classList.add('hidden');
        });
        
        const menu = document.getElementById(`menu-${id}`);
        menu.classList.toggle('hidden');
    };

    // Close menu when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.action-menu').forEach(menu => menu.classList.add('hidden'));
    });

    // Expanded regex for video formats
    const isVideo = data.type === 'video' || 
                    (data.name && data.name.match(/\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv)$/i)) ||
                    (data.storage_ref && data.storage_ref.match(/\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv)$/i)) ||
                    (data.url && data.url.match(/\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv)$/i));
                    
    const type = isVideo ? 'video' : 'image';

    if (viewLayout === 'grid') {
        div.className = 'group relative flex flex-col justify-between bg-dark-surface border border-white/5 rounded-2xl hover:shadow-neon-cyan transition-all duration-300 transform hover:-translate-y-1 h-56 z-0 hover:z-20';
        
        let mediaPreview = '';
        if (isVideo) {
            mediaPreview = `
                <div class="w-full h-full flex items-center justify-center bg-black/50 relative">
                     <span class="material-icons-outlined text-4xl text-white/80 absolute z-10">play_circle_outline</span>
                     <video src="${data.url}#t=1" class="object-cover w-full h-full opacity-60 rounded-xl" preload="metadata"></video>
                </div>
            `;
        } else {
            mediaPreview = `<img src="${data.url}" alt="${data.name}" class="object-cover w-full h-full rounded-xl" loading="lazy">`;
        }

        div.innerHTML = `
            <div class="absolute inset-0 bg-gradient-to-b from-neon-cyan/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0 rounded-2xl"></div>
            <div class="h-40 w-full bg-dark-bg/50 flex items-center justify-center overflow-hidden relative z-1 p-2 cursor-pointer rounded-t-2xl" onclick="openImageModal('${data.url}', '${data.name}', '${type}')">
                ${mediaPreview}
                ${data.is_shared ? '<div class="absolute top-2 left-2 bg-neon-purple/80 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm z-10">Shared</div>' : ''}
            </div>
            
            <div class="px-3 py-3 bg-dark-surface flex items-center justify-between border-t border-white/5 relative z-10 rounded-b-2xl">
                <div class="flex items-center gap-2 min-w-0">
                    <span class="material-icons-outlined text-neon-cyan text-sm">${isVideo ? 'movie' : 'image'}</span>
                    <span class="text-sm font-medium text-gray-300 truncate w-24 md:w-32 group-hover:text-white transition-colors" title="${data.name}">${data.name}</span>
                </div>
                
                <!-- Action Menu Button -->
                <div class="relative">
                    <button onclick="toggleMenu(${data.id}, event)" class="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                        <span class="material-icons-outlined">more_vert</span>
                    </button>
                    <!-- Dropdown -->
                    <div id="${menuId}" class="action-menu hidden absolute right-0 bottom-full mb-1 w-48 bg-dark-surface border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden ring-1 ring-white/5">
                        <div class="py-1">
                            ${menuItems.replace("openImageModal('" + data.url + "', '" + data.name + "')", "openImageModal('" + data.url + "', '" + data.name + "', '" + type + "')")} 
                        </div>
                    </div>
                </div>
            </div>
        `;
    
    } else {
        // === LIST VIEW ===
        div.className = 'flex items-center gap-4 p-3 bg-dark-surface border border-white/5 rounded-xl hover:bg-white/5 transition-colors group relative z-0 hover:z-20';
        
        const sizeMB = (data.size ? data.size / (1024*1024) : 0).toFixed(2);
        
        let listPreview = '';
        if (isVideo) {
            listPreview = `<div class="w-full h-full flex items-center justify-center bg-black/50"><span class="material-icons-outlined text-white">movie</span></div>`;
        } else {
            listPreview = `<img src="${data.url}" alt="${data.name}" class="w-full h-full object-cover">`;
        }

        div.innerHTML = `
            <div class="w-12 h-12 flex-shrink-0 bg-dark-bg rounded-lg overflow-hidden border border-white/10 relative cursor-pointer" onclick="openImageModal('${data.url}', '${data.name}', '${type}')">
                ${listPreview}
                ${data.is_shared ? '<div class="absolute bottom-0 right-0 bg-neon-purple w-3 h-3 rounded-tl-lg"></div>' : ''}
            </div>
            
            <div class="flex-1 min-w-0">
                <h4 class="text-sm font-medium text-gray-200 truncate group-hover:text-neon-cyan transition-colors" title="${data.name}">${data.name}</h4>
                <div class="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span>${sizeMB} MB</span>
                    <span>•</span>
                    <span>${new Date(data.created_at).toLocaleDateString()}</span>
                    ${data.is_shared ? '<span class="text-neon-purple">• Shared</span>' : ''}
                </div>
            </div>

            <!-- Action Menu Button -->
            <div class="relative ml-auto">
                <button onclick="toggleMenu(${data.id}, event)" class="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                    <span class="material-icons-outlined">more_vert</span>
                </button>
                <!-- Dropdown -->
                <div id="${menuId}" class="action-menu hidden absolute right-0 top-full mt-2 w-48 bg-dark-surface border border-white/10 rounded-xl shadow-2xl backdrop-blur-lg z-50 overflow-hidden ring-1 ring-white/5">
                    <div class="py-1">
                         ${menuItems.replace("openImageModal('" + data.url + "', '" + data.name + "')", "openImageModal('" + data.url + "', '" + data.name + "', '" + type + "')")} 
                    </div>
                </div>
            </div>
        `;
    }

    return div;
}

window.renameFile = function(id, currentName) {
    Alert.prompt("Rename File", "Enter a new name for the file:", currentName, async (newName) => {
        if (!newName || newName.trim() === '') return;
        
        // Preserve extension logic
        const originalExt = currentName.split('.').pop();
        const hasExt = newName.includes('.');
        
        let finalName = newName.trim();
        
        // If the original name had an extension and the new name doesn't, append it
        if (originalExt && originalExt !== currentName && !hasExt) {
             finalName = `${finalName}.${originalExt}`;
        }
        
        const { error } = await supabaseClient.from('images').update({ name: finalName }).eq('id', id);
        
        if (error) {
            Alert.error("Rename Error", error.message);
        } else {
            Toast.show("File renamed successfully!", "success");
            fetchFiles();
        }
    });
};

window.moveToTrash = function(id) {
    Alert.confirm("Move to Trash?", "This file will be moved to the trash bin.", async () => {
        await supabaseClient.from('images').update({ is_trashed: true }).eq('id', id);
        Toast.show("File moved to Trash", "info");
        fetchFiles();
    });
};

window.restoreImage = async function(id) {
    await supabaseClient.from('images').update({ is_trashed: false }).eq('id', id);
    Toast.show("File restored!", "success");
    fetchFiles();
};

window.toggleFavorite = async function(id, currentStatus) {
    const newStatus = !currentStatus;
    await supabaseClient.from('images').update({ is_favorite: newStatus }).eq('id', id);
    Toast.show(newStatus ? "Added to Favorites" : "Removed from Favorites", "success");
    fetchFiles();
};

window.shareImage = async function(id, url) {
    // 1. Copy to Clipboard
    try {
        await navigator.clipboard.writeText(url);
        
        // 2. Mark as Shared in DB
        await supabaseClient.from('images').update({ is_shared: true }).eq('id', id);
        
        Toast.show("Link copied & Marked as Shared!", "success");
        fetchFiles();
    } catch (err) {
        console.error("Share failed:", err);
        Alert.error("Share Failed", "Could not copy link.");
    }
};

window.deletePermanently = function(id, storageRef) {
    Alert.confirm("Delete Permanently?", "This action cannot be undone!", async () => {
        const { error: storeErr } = await supabaseClient.storage.from('gallery').remove([storageRef]);
        if(storeErr) { Alert.error("Delete Failed", storeErr.message); return; }

        await supabaseClient.from('images').delete().eq('id', id);
        Toast.show("File deleted permanently", "success");
        fetchFiles();
        updateStorageUsage();
    });
};

// Storage Calculation
async function updateStorageUsage() {
    const { data } = await supabaseClient.from('images').select('size');
    if (!data) return;
    
    const totalBytes = data.reduce((acc, curr) => acc + (curr.size || 0), 0);
    const maxBytes = 1 * 1024 * 1024 * 1024; // 1GB Free Tier (Standard)
    const percentage = Math.min((totalBytes / maxBytes) * 100, 100).toFixed(1);
    
    // Convert to readable format
    const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);
    const maxMB = 1000; // Display as 1000 MB for clarity

    storageBar.style.width = `${percentage}%`;
    storageText.innerText = `${totalMB} MB / ${maxMB} MB`;
    
    // Change color if near full
    if (percentage > 90) {
        storageBar.classList.remove('from-neon-cyan', 'to-neon-purple');
        storageBar.classList.add('bg-neon-pink');
    }
}

// Init
fetchFiles();
updateStorageUsage();


