import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Configure Supabase
const SUPABASE_URL = 'https://ursranhuyjdmauhwomsc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyc3Jhbmh1eWpkbWF1aHdvbXNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMTg0MDIsImV4cCI6MjA3MTY5NDQwMn0.adCbSwWildrN7yCz0zynN4btaF3EgzD1BbdTlHXomdA';

let supabase;
try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabaseClient = supabase;
    window.supabase = supabase; // Expose as global variable
} catch (e) {
    console.error("Supabase Init Error:", e);
}

// Auth State Management
let currentUser = null;

// Check current session on load
window.checkSession = async function() {
    if (!supabase) return;
    try {
        const { data, error } = await supabase.auth.getSession();
        if (data && data.session) {
            currentUser = data.session.user;
            window.currentUser = currentUser;
            updateAuthUI();
        }
    } catch (e) {
        console.error("Session check error:", e);
    }
}

// Update UI based on auth state
function updateAuthUI() {
    const authBtn = document.getElementById('auth-btn');
    if (currentUser) {
        authBtn.textContent = 'LOGOUT';
        authBtn.classList.replace('bg-gray-200', 'bg-retro-red');
        authBtn.classList.replace('text-black', 'text-white');
    } else {
        authBtn.textContent = 'LOGIN';
        authBtn.classList.replace('bg-retro-red', 'bg-gray-200');
        authBtn.classList.replace('text-white', 'text-black');
    }
}

window.authActionType = 'login';
window.setAuthAction = function(type) {
    window.authActionType = type;
}

window.toggleAuthMode = function() {
    const title = document.getElementById('auth-title');
    const submitBtn = document.getElementById('auth-submit-btn');
    const toggleDesc = document.getElementById('auth-toggle-desc');
    const toggleBtn = document.getElementById('auth-toggle-btn');
    const msgEl = document.getElementById('auth-message');
    
    if (msgEl) msgEl.classList.add('hidden'); // Clear previous messages
    
    if (window.authActionType === 'login') {
        // Switch to Register
        window.setAuthAction('register');
        if (title) title.textContent = 'REGISTER';
        if (submitBtn) {
            submitBtn.textContent = 'Register';
            submitBtn.classList.replace('bg-retro-blue', 'bg-retro-pink');
        }
        if (toggleDesc) toggleDesc.textContent = 'Sudah punya akun?';
        if (toggleBtn) {
            toggleBtn.textContent = 'Login di sini';
            toggleBtn.classList.replace('text-retro-blue', 'text-retro-pink');
            toggleBtn.classList.replace('hover:text-retro-pink', 'hover:text-retro-blue');
        }
    } else {
        // Switch to Login
        window.setAuthAction('login');
        if (title) title.textContent = 'LOGIN';
        if (submitBtn) {
            submitBtn.textContent = 'Login';
            submitBtn.classList.replace('bg-retro-pink', 'bg-retro-blue');
        }
        if (toggleDesc) toggleDesc.textContent = 'Belum punya akun?';
        if (toggleBtn) {
            toggleBtn.textContent = 'Daftar di sini';
            toggleBtn.classList.replace('text-retro-pink', 'text-retro-blue');
            toggleBtn.classList.replace('hover:text-retro-blue', 'hover:text-retro-pink');
        }
    }
}

// Handle Login/Register
window.handleAuth = async function(event) {
    event.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const msgEl = document.getElementById('auth-message');
    
    msgEl.classList.remove('hidden', 'text-retro-red', 'text-retro-green');
    msgEl.textContent = 'Processing...';

    let result;
    if (window.authActionType === 'register') {
        result = await supabase.auth.signUp({
            email: email,
            password: password,
        });
    } else {
        result = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
    }

    const { data, error } = result;

    if (error) {
        msgEl.textContent = error.message;
        msgEl.classList.add('text-retro-red');
    } else {
        msgEl.textContent = window.authActionType === 'login' ? 'Login successful!' : 'Registration successful! Check your email.';
        msgEl.classList.add('text-retro-green');
        currentUser = data?.user || data?.session?.user;
        window.currentUser = currentUser;
        updateAuthUI();
        setTimeout(() => {
            if (typeof window.toggleAuthModal === 'function') {
                window.toggleAuthModal();
            }
        }, 1500);
    }
}

// Handle Logout
window.handleLogout = async function() {
    await supabase.auth.signOut();
    currentUser = null;
    window.currentUser = null;
    updateAuthUI();
    alert('Logged out successfully.');
    // Redirect away from protected view if needed
    if (window.location.pathname.includes('draw.html')) {
        window.location.href = 'collection.html';
    }
}

// Initialize Auth
checkSession();

// Function to fetch User Collections
async function fetchUserCollections() {
    try {
        const { data, error } = await supabase
            .from('user_collections')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    } catch (err) {
        console.error("Error fetching collections:", err.message);
        return [];
    }
}
window.fetchUserCollections = fetchUserCollections;
