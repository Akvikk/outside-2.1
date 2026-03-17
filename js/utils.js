// =========================================================
// FON OUTSIDE - Shared Utilities
// =========================================================

// Ripple effect for tactile button feedback
function createRipple(event) {
    const btn = event.currentTarget;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple-span';
    ripple.style.left = (event.clientX - rect.left) + 'px';
    ripple.style.top = (event.clientY - rect.top) + 'px';
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
}

const app = {
    ui: new Proxy({}, {
        get(target, prop) {
            if (!target[prop]) target[prop] = document.getElementById(prop);
            return target[prop];
        }
    }),
    utils: {
        showToast(message, type = 'info') {
            const container = document.getElementById('toast-container');
            if (!container) return;
            const toast = document.createElement('div');
            toast.className = 'toast';
            let icon = '<i class="fas fa-info-circle text-blue-400"></i>';
            if (type === 'success') icon = '<i class="fas fa-check-circle text-green-400"></i>';
            if (type === 'error') icon = '<i class="fas fa-exclamation-circle text-red-400"></i>';
            if (type === 'warning') icon = '<i class="fas fa-exclamation-triangle text-yellow-400"></i>';
            toast.innerHTML = `${icon} <span class="font-bold text-xs tracking-wide">${message}</span>`;
            container.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                toast.style.transition = 'all 0.3s ease-in';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        },
        sanitizeString(str) {
            if (typeof str !== 'string') return str;
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        },
        saveLocal(key, data) {
            localStorage.setItem(key, JSON.stringify(data));
        },
        loadLocal(key) {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        }
    }
};

// Expose app for inline HTML handlers that call app.*
window.app = app;
