document.addEventListener('DOMContentLoaded', () => {
    const feedContainer = document.getElementById('feed-container');
    const spinner = document.getElementById('loading-spinner');
    const errorContainer = document.getElementById('error-container');
    const retryBtn = document.getElementById('retry-btn');
    const toastContainer = document.getElementById('toast-container');

    // Dynamically get the base path for GitHub Pages compatibility
    const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);

    // State management
    let feedData = [];
    const interactionsKey = 'feed_user_interactions';
    
    // SVGs for UI
    const icons = {
        like: `<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
        dislike: `<svg viewBox="0 0 24 24"><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/></svg>`,
        share: `<svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>`,
        volumeOn: `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`,
        volumeOff: `<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`
    };

    // Initialize App
    const init = async () => {
        spinner.classList.add('active');
        errorContainer.classList.remove('active');
        
        try {
            const response = await fetch(`${basePath}Feed.json`);
            if (!response.ok) throw new Error('Network response was not ok');
            feedData = await response.json();
            renderFeed();
        } catch (error) {
            console.error('Error loading feed:', error);
            errorContainer.classList.add('active');
        } finally {
            spinner.classList.remove('active');
        }
    };

    retryBtn.addEventListener('click', init);

    // Get Interactions from LocalStorage
    const getInteractions = () => JSON.parse(localStorage.getItem(interactionsKey)) || {};
    const setInteractions = (data) => localStorage.setItem(interactionsKey, JSON.stringify(data));

    // Render Feed items dynamically
    const renderFeed = () => {
        feedContainer.innerHTML = ''; // Clear container
        const interactions = getInteractions();

        feedData.forEach((item) => {
            const feedItem = document.createElement('div');
            feedItem.className = 'feed-item';
            feedItem.dataset.id = item.id;

            const isLiked = interactions[item.id] === 'like';
            const isDisliked = interactions[item.id] === 'dislike';

            const adjustedLikes = item.likes + (isLiked ? 1 : 0);
            const adjustedDislikes = item.dislikes + (isDisliked ? 1 : 0);

            // Create inner HTML
            feedItem.innerHTML = `
                ${item.type === 'video' 
                    ? `<video class="media-element" data-src="${basePath}content/${item.file}" loop playsinline preload="none"></video>` 
                    : `<img class="media-element" data-src="${basePath}content/${item.file}" alt="${item.title}" loading="lazy">`
                }
                
                <div class="overlay-bottom">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                    <span class="date">${new Date(item.date).toLocaleDateString()}</span>
                </div>

                <div class="overlay-right">
                    <div class="btn-wrapper">
                        <button class="glass-btn action-btn like ${isLiked ? 'active' : ''}" data-type="like">
                            ${icons.like}
                        </button>
                        <span class="count-text like-count">${adjustedLikes}</span>
                    </div>

                    <div class="btn-wrapper">
                        <button class="glass-btn action-btn dislike ${isDisliked ? 'active' : ''}" data-type="dislike">
                            ${icons.dislike}
                        </button>
                        <span class="count-text dislike-count">${adjustedDislikes}</span>
                    </div>

                    <div class="btn-wrapper">
                        <button class="glass-btn share-btn">
                            ${icons.share}
                        </button>
                    </div>

                    ${item.type === 'video' ? `
                    <div class="volume-control-container">
                        <button class="glass-btn mute-btn">
                            ${icons.volumeOn}
                        </button>
                        <input type="range" class="volume-slider" min="0" max="1" step="0.1" value="1">
                    </div>` : ''}
                </div>
            `;

            attachEventListeners(feedItem, item);
            feedContainer.appendChild(feedItem);
        });

        setupObservers();
    };

    // Attach specific events per item
    const attachEventListeners = (el, itemData) => {
        // Like & Dislike
        const likeBtn = el.querySelector('.like');
        const dislikeBtn = el.querySelector('.dislike');
        const likeCount = el.querySelector('.like-count');
        const dislikeCount = el.querySelector('.dislike-count');

        const handleInteraction = (action) => {
            let interactions = getInteractions();
            const currentAction = interactions[itemData.id];

            // Toggle logic
            if (currentAction === action) {
                delete interactions[itemData.id]; // Remove action
                showToast(`Removed ${action}`);
            } else {
                interactions[itemData.id] = action; // Set new action
                showToast(`${action.charAt(0).toUpperCase() + action.slice(1)} added`);
            }

            setInteractions(interactions);
            
            // Re-calculate counts
            const isLiked = interactions[itemData.id] === 'like';
            const isDisliked = interactions[itemData.id] === 'dislike';
            
            likeBtn.classList.toggle('active', isLiked);
            dislikeBtn.classList.toggle('active', isDisliked);
            
            likeCount.textContent = itemData.likes + (isLiked ? 1 : 0);
            dislikeCount.textContent = itemData.dislikes + (isDisliked ? 1 : 0);
        };

        likeBtn.addEventListener('click', () => handleInteraction('like'));
        dislikeBtn.addEventListener('click', () => handleInteraction('dislike'));

        // Share functionality
        const shareBtn = el.querySelector('.share-btn');
        shareBtn.addEventListener('click', async () => {
            const shareData = {
                title: itemData.title,
                text: itemData.description,
                url: window.location.href + `?id=${itemData.id}`
            };

            if (navigator.share) {
                try {
                    await navigator.share(shareData);
                    showToast('Shared successfully!');
                } catch (err) {
                    if (err.name !== 'AbortError') showToast('Error sharing');
                }
            } else {
                navigator.clipboard.writeText(shareData.url).then(() => {
                    showToast('Link copied to clipboard!');
                }).catch(() => {
                    showToast('Failed to copy link');
                });
            }
        });

        // Video Controls
        if (itemData.type === 'video') {
            const media = el.querySelector('.media-element');
            const muteBtn = el.querySelector('.mute-btn');
            const volSlider = el.querySelector('.volume-slider');

            // Handle Error Fallback
            media.addEventListener('error', () => {
                media.outerHTML = `<div class="media-element fallback-image">Media Unavailable</div>`;
            });

            // Prompt requires sound ENABLED by default
            media.muted = false; 
            media.volume = 1;

            muteBtn.addEventListener('click', () => {
                media.muted = !media.muted;
                muteBtn.innerHTML = media.muted ? icons.volumeOff : icons.volumeOn;
                volSlider.value = media.muted ? 0 : media.volume;
            });

            volSlider.addEventListener('input', (e) => {
                media.volume = e.target.value;
                if (media.volume > 0 && media.muted) {
                    media.muted = false;
                    muteBtn.innerHTML = icons.volumeOn;
                } else if (media.volume == 0) {
                    media.muted = true;
                    muteBtn.innerHTML = icons.volumeOff;
                }
            });
        }
    };

    // Observers: Lazy Loading & Playback logic
    const setupObservers = () => {
        // 1. Lazy Loading Observer (Loads src when approaching viewport)
        const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const media = entry.target.querySelector('.media-element');
                    if (media && media.dataset.src) {
                        media.src = media.dataset.src;
                        media.removeAttribute('data-src');
                        if(media.tagName === 'VIDEO') media.load();
                    }
                }
            });
        }, { rootMargin: '100% 0px' }); // Trigger 1 viewport ahead

        // 2. Playback Observer (Autoplay/Pause based on visibility)
        const playbackObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const media = entry.target.querySelector('.media-element');
                if (media && media.tagName === 'VIDEO') {
                    if (entry.isIntersecting) {
                        // Play if visible. Handle browser autoplay block.
                        const playPromise = media.play();
                        if (playPromise !== undefined) {
                            playPromise.catch(error => {
                                // If browser blocks unmuted autoplay, mute and try again
                                media.muted = true;
                                const muteBtn = entry.target.querySelector('.mute-btn');
                                const volSlider = entry.target.querySelector('.volume-slider');
                                if(muteBtn) muteBtn.innerHTML = icons.volumeOff;
                                if(volSlider) volSlider.value = 0;
                                media.play();
                                showToast("Autoplay muted by browser. Tap speaker to unmute.");
                            });
                        }
                    } else {
                        // Pause if off-screen
                        media.pause();
                    }
                }
            });
        }, { threshold: 0.6 }); // Trigger when 60% of item is visible

        document.querySelectorAll('.feed-item').forEach(item => {
            lazyLoadObserver.observe(item);
            playbackObserver.observe(item);
        });
    };

    // Toast Notification System
    const showToast = (message) => {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toastContainer.appendChild(toast);

        // Trigger reflow for animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Remove after 3s
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300); // Wait for transition
        }, 3000);
    };

    // Kickoff
    init();
});
