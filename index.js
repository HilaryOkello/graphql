let currentUser = null;
let isDarkMode = false;

// Dark mode toggle
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
        document.body.className = 'bg-slate-900 text-slate-300 min-h-screen transition-colors duration-300';
        // Update all cards
        document.querySelectorAll('.bg-slate-50').forEach(el => {
            el.className = el.className.replace('bg-slate-50', 'bg-slate-800');
        });
        document.querySelectorAll('.border-blue-200').forEach(el => {
            el.className = el.className.replace('border-blue-200', 'border-slate-600');
        });
        document.querySelectorAll('.text-slate-900').forEach(el => {
            el.className = el.className.replace('text-slate-900', 'text-slate-100');
        });
        document.querySelectorAll('.bg-slate-200').forEach(el => {
            if (!el.querySelector('.bg-green-500, .bg-blue-600, .bg-purple-500, .bg-yellow-500, .bg-red-500, .bg-cyan-500, .bg-pink-500')) {
                el.className = el.className.replace('bg-slate-200', 'bg-blue-200');
            }
        });
    } else {
        document.body.className = 'bg-slate-200 text-blue-200 min-h-screen transition-colors duration-300';
        // Revert all cards
        document.querySelectorAll('.bg-slate-800').forEach(el => {
            el.className = el.className.replace('bg-slate-800', 'bg-slate-50');
        });
        document.querySelectorAll('.border-slate-600').forEach(el => {
            el.className = el.className.replace('border-slate-600', 'border-blue-200');
        });
        document.querySelectorAll('.text-slate-100').forEach(el => {
            el.className = el.className.replace('text-slate-100', 'text-slate-900');
        });
        document.querySelectorAll('.bg-blue-200').forEach(el => {
            if (!el.querySelector('.bg-green-500, .bg-blue-600, .bg-purple-500, .bg-yellow-500, .bg-red-500, .bg-cyan-500, .bg-pink-500')) {
                el.className = el.className.replace('bg-blue-200', 'bg-slate-200');
            }
        });
    }
}

// Event listeners
document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
document.getElementById('darkModeToggleProfile').addEventListener('click', toggleDarkMode);

// Login form handler
const loginFrom = document.getElementById('loginForm')
if (loginFrom === null) {
    console.error('Login form not found');
}
addEventListener('submit', function (e) {
    e.preventDefault();
    console.log('Login form submitted');

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Simulate authentication (replace with actual GraphQL call)
    if (username && password) {
        // Hide error message
        document.getElementById('errorMessage').classList.add('hidden');

        // Simulate successful login
        currentUser = { id: 42, login: username };

        // Switch to profile page
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('profilePage').classList.remove('hidden');
    } else {
        // Show error message
        document.getElementById('errorMessage').classList.remove('hidden');
    }
});

// Logout handler
document.getElementById('logoutBtn').addEventListener('click', function () {
    currentUser = null;
    document.getElementById('profilePage').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');

    // Clear form
    document.getElementById('loginForm').reset();
    document.getElementById('errorMessage').classList.add('hidden');
});

// Add some interactive hover effects for SVG elements
document.querySelectorAll('circle, path, polyline').forEach(element => {
    element.addEventListener('mouseenter', function () {
        this.style.opacity = '0.5';
        this.style.transform = 'scale(1.01)';
        this.style.transformOrigin = 'center';
        this.style.transition = 'all 0.15s ease';
    });

    element.addEventListener('mouseleave', function () {
        this.style.opacity = '1';
        this.style.transform = 'scale(1)';
    });
});