class Auth {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('flickrate_users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('flickrate_session')) || null;
    }

    init() {
        if (this.currentUser) {
            this.showApp();
        } else {
            this.showLogin();
        }
        
        // Event Listeners for Forms
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('signupForm').addEventListener('submit', (e) => this.handleSignup(e));
        
        // Toggles
        document.getElementById('toSignup').addEventListener('click', () => {
            document.getElementById('login-view').classList.add('hidden');
            document.getElementById('signup-view').classList.remove('hidden');
        });
        document.getElementById('toLogin').addEventListener('click', () => {
            document.getElementById('signup-view').classList.add('hidden');
            document.getElementById('login-view').classList.remove('hidden');
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
    }

    handleSignup(e) {
        e.preventDefault();
        const user = document.getElementById('regUser').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const pass = document.getElementById('regPass').value.trim();

        if (this.users.find(u => u.username === user)) {
            alert('Username already exists!');
            return;
        }

        const newUser = {
            id: Date.now(),
            username: user,
            email: email,
            password: pass, // In a real app, hash this!
            points: 0,
            ratings: [],
            joined: new Date().toLocaleDateString()
        };

        this.users.push(newUser);
        this.saveUsers();
        
        // Auto login
        this.currentUser = newUser;
        this.saveSession();
        this.showApp();
    }

    handleLogin(e) {
        e.preventDefault();
        const user = document.getElementById('loginUser').value.trim();
        const pass = document.getElementById('loginPass').value.trim();

        const account = this.users.find(u => u.username === user && u.password === pass);

        if (account) {
            this.currentUser = account;
            this.saveSession();
            this.showApp();
        } else {
            alert('Invalid credentials');
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('flickrate_session');
        window.location.reload(); // Simple reload to clear state
    }

    saveUsers() {
        localStorage.setItem('flickrate_users', JSON.stringify(this.users));
    }

    saveSession() {
        localStorage.setItem('flickrate_session', JSON.stringify(this.currentUser));
    }

    showApp() {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        
        // Init the Main App
        if (window.app) {
            window.app.start(this.currentUser);
        }
    }
    
    showLogin() {
        document.getElementById('auth-container').classList.remove('hidden');
        document.getElementById('app-container').classList.add('hidden');
    }

    // Helper to update current user data (points etc) in the main array
    updateUser(updatedUser) {
        this.currentUser = updatedUser;
        this.saveSession();
        
        const idx = this.users.findIndex(u => u.id === updatedUser.id);
        if (idx !== -1) {
            this.users[idx] = updatedUser;
            this.saveUsers();
        }
    }
}

// Initialize Auth
window.auth = new Auth();
