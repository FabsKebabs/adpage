class App {
    constructor() {
        this.user = null;
        this.player = null;
        this.currentTrailer = null; // Changed from currentVideoId
        this.watchCompelete = false;
        this.rating = 0;

        // Mock Curated Library
        this.library = [
            // --- PASTE NEW TRAILERS HERE ---
            // { id: 'unique_id', videoId: 'YOUTUBE_ID', title: 'Movie Title', desc: 'Description', thumb: 'THUMBNAIL_URL' },
            {
                id: 'kung_fu_panda_4',
                videoId: 'y4ZBSzYUTL0', // From user's embed
                title: 'Kung Fu Panda 4',
                desc: 'Po must train a new warrior when hes chosen to become the spiritual leader of the Valley of Peace.',
                thumb: 'https://img.youtube.com/vi/y4ZBSzYUTL0/maxresdefault.jpg'
            }
        ];
    }

    start(user) {
        this.user = user;
        this.updateProfileUI();
        this.updateWalletUI();
        this.renderHistory();
        this.renderLibrary(); // New
        this.setupEventListeners();

        // Auto-load first trailer
        this.loadTrailer(this.library[0]);

        // Default Tab
        this.switchTab('rate');
    }

    updateProfileUI() {
        document.getElementById('navUsername').innerText = this.user.username;
        document.getElementById('headerUsername').innerText = `Hi, ${this.user.username}`;
        // Generate initials
        const initial = this.user.username.charAt(0).toUpperCase();
        document.getElementById('navAvatar').innerText = initial;
    }

    updateWalletUI() {
        const els = document.querySelectorAll('.display-points');
        els.forEach(el => el.innerText = this.user.points);
    }

    setupEventListeners() {
        // Tab Switching (Desktop & Mobile)
        document.querySelectorAll('[data-tab]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = btn.dataset.tab; // Fix: get from dataset correctly
                // Handle bubbling if svg clicked
                const target = e.target.closest('[data-tab]');
                if (target) this.switchTab(target.dataset.tab);
            });
        });

        // Stars
        document.querySelectorAll('.star-icon').forEach(star => {
            star.addEventListener('click', () => {
                const val = parseInt(star.dataset.val);
                this.setRating(val);
            });
        });

        // Submit
        document.getElementById('submitBtn').addEventListener('click', () => this.startSubmitFlow());
    }

    switchTab(tabName) {
        // 1. Hide all views
        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
        // 2. Show target view
        document.getElementById(`view-${tabName}`).classList.add('active');

        // 3. Update Nav States
        document.querySelectorAll('[data-tab]').forEach(btn => {
            if (btn.dataset.tab === tabName) btn.classList.add('active');
            else btn.classList.remove('active');
        });
    }

    /* --- Library Logic --- */
    renderLibrary() {
        const container = document.getElementById('trailerGrid');
        container.innerHTML = '';

        this.library.forEach(item => {
            const card = document.createElement('div');
            card.className = 'trailer-card';
            card.onclick = () => this.loadTrailer(item);
            card.innerHTML = `
                <img src="${item.thumb}" loading="lazy">
                <div class="trailer-info">
                    <div class="trailer-title">${item.title}</div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    loadTrailer(item) {
        this.currentTrailer = item;
        this.watchCompelete = false;
        this.setRating(0); // Reset rating for new video

        // Update UI
        document.getElementById('movieTitle').innerText = item.title;
        document.getElementById('movieDesc').innerText = item.desc;

        // Highlight active card
        document.querySelectorAll('.trailer-card').forEach(c => c.classList.remove('active'));

        // Show Video Container
        document.getElementById('videoContainer').classList.add('visible');
        document.getElementById('ratingPanel').classList.add('visible');

        // --- Create embedded iframe with API enabled ---
        const container = document.getElementById('player');
        container.innerHTML = '';

        const iframe = document.createElement('iframe');
        iframe.id = 'yt-iframe';
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.src = `https://www.youtube.com/embed/${item.videoId}?enablejsapi=1`;
        iframe.title = 'YouTube video player';
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.allowFullscreen = true;

        container.appendChild(iframe);

        // Initialize player with API
        setTimeout(() => this.initPlayer('yt-iframe'), 500);

        this.updateStatus("⏱️ Watch the complete video to rate");
        document.getElementById('submitBtn').disabled = true;

        // Scroll to top
        document.getElementById('view-rate').scrollIntoView({ behavior: 'smooth' });
    }

    initPlayer(iframeId) {
        // Destroy old player if exists
        if (this.player) {
            try { this.player.destroy(); } catch(e) {}
            this.player = null;
        }

        // Create new player instance
        this.player = new YT.Player(iframeId, {
            events: {
                'onReady': (e) => this.onPlayerReady(e),
                'onStateChange': (e) => this.onPlayerStateChange(e),
                'onError': (e) => console.error('YT Error:', e.data)
            }
        });
    }

    onPlayerReady(event) {
        // Player is ready - start monitoring for skipping
        this.lastPlayedTime = 0;
        this.startSkipMonitoring();
    }

    startSkipMonitoring() {
        // Check every 100ms if user is trying to skip
        if (this.skipCheckInterval) clearInterval(this.skipCheckInterval);
        
        this.skipCheckInterval = setInterval(() => {
            if (!this.player || !this.currentTrailer) return;
            
            try {
                const currentTime = this.player.getCurrentTime();
                const totalTime = this.player.getDuration();
                
                // If video isn't complete but jumped forward more than 3 seconds, reset it
                if (!this.watchCompelete && this.lastPlayedTime && currentTime - this.lastPlayedTime > 3) {
                    this.player.seekTo(this.lastPlayedTime);
                    this.player.pauseVideo();
                    this.updateStatus("⚠️ You must watch the entire video. Skipping not allowed.");
                    return;
                }
                
                this.lastPlayedTime = currentTime;
            } catch(e) {
                // Ignore errors from API calls
            }
        }, 100);
    }

    onPlayerStateChange(event) {
        // -1: unstarted, 0: ended, 1: playing, 2: paused, 3: buffering, 5: cued
        if (event.data === YT.PlayerState.ENDED) {
            this.watchCompelete = true;
            if (this.skipCheckInterval) clearInterval(this.skipCheckInterval);
            this.updateStatus("✅ Complete! Rate now.");
            document.getElementById('submitBtn').disabled = false;
        } else if (event.data === YT.PlayerState.PLAYING) {
            if (!this.watchCompelete) {
                this.updateStatus("⏱️ Watch the complete video to rate");
            }
        }
    }

    updateStatus(msg) {
        document.getElementById('statusMsg').innerText = msg;
    }

    setRating(val) {
        this.rating = val;
        document.querySelectorAll('.star-icon').forEach(s => {
            s.classList.toggle('active', parseInt(s.dataset.val) <= val);
        });
    }

    /* --- Submission Flow --- */
    startSubmitFlow() {
        if (!this.currentTrailer || this.rating === 0) {
            alert('Rate the movie first!');
            return;
        }

        // Show Ad Interstitial
        this.runAdSimulation(() => {
            this.completeSubmission();
        });
    }

    runAdSimulation(callback) {
        const modal = document.getElementById('adModal');
        const timerEl = document.getElementById('adTimer');
        let timeLeft = 5;

        modal.classList.add('active');
        timerEl.innerText = timeLeft;

        const interval = setInterval(() => {
            timeLeft--;
            timerEl.innerText = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(interval);
                modal.classList.remove('active');
                callback();
            }
        }, 1000);
    }

    completeSubmission() {
        // 1. Add Points
        this.user.points += 10;

        // 2. Save Rating
        const record = {
            id: Date.now(),
            videoId: this.currentTrailer.videoId,
            title: this.currentTrailer.title,
            rating: this.rating,
            review: document.getElementById('reviewText').value,
            date: new Date().toLocaleDateString()
        };
        this.user.ratings.unshift(record);

        // 3. Persist via Auth
        window.auth.updateUser(this.user);

        // 4. Update UI
        this.updateWalletUI();
        this.renderHistory();

        // Reset Review Text only (don't unload video)
        document.getElementById('reviewText').value = '';
        this.setRating(0);

        alert(`Rated "${this.currentTrailer.title}"! +10 Points Earned.`);
    }

    /* --- History --- */
    renderHistory() {
        const grid = document.getElementById('historyGrid');
        grid.innerHTML = '';

        this.user.ratings.forEach(r => {
            const card = document.createElement('div');
            card.className = 'history-item';
            card.innerHTML = `
                <img src="https://img.youtube.com/vi/${r.videoId}/mqdefault.jpg" class="history-thumb">
                <button class="btn-delete-mini" onclick="app.deleteRating(${r.id})">✕</button>
                <div class="history-meta">
                    <div style="font-weight:600">${r.title}</div>
                    <div class="history-rating">${'★'.repeat(r.rating)}</div>
                </div>
                <div style="font-size:0.8rem; color:#888;">${r.review || 'No review'}</div>
            `;
            grid.appendChild(card);
        });
    }

    deleteRating(id) {
        if (confirm('Delete rating?')) {
            this.user.ratings = this.user.ratings.filter(r => r.id !== id);
            window.auth.updateUser(this.user);
            this.renderHistory();
        }
    }
}

// Init App Instance
window.app = new App();

// On Load
document.addEventListener('DOMContentLoaded', () => {
    window.auth.init();
});
