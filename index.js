let currentUser = null;
let jwt = null;
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
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    console.log('Login form submitted');

    const identifier = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!identifier || !password) {
        document.getElementById('errorMessage').textContent = 'Please enter both username/email and password.';
        document.getElementById('errorMessage').classList.remove('hidden');
        return;
    }

    try {
        const credentials = btoa(`${identifier}:${password}`);
        const response = await fetch('https://learn.zone01kisumu.ke/api/auth/signin', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`
            }
        });

        if (!response.ok) {
            throw new Error('Invalid credentials. Please try again.');
        }

        jwt = await response.text();

        // Decode JWT to get user info (just payload part)
        const payloadBase64 = jwt.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        currentUser = { id: decodedPayload.id, login: decodedPayload.login };

        console.log('Logged in as:', currentUser);

        // Hide error and switch to profile page
        document.getElementById('errorMessage').classList.add('hidden');
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('profilePage').classList.remove('hidden');

    } catch (err) {
        document.getElementById('errorMessage').textContent = err.message;
        document.getElementById('errorMessage').classList.remove('hidden');
    }
});

// Logout handler
document.getElementById('logoutBtn').addEventListener('click', function () {
    jwt = null;
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