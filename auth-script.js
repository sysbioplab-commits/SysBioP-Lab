// Storage keys
const STORAGE_KEY_USERS = 'sysbiolab_users';
const STORAGE_KEY_CURRENT_USER = 'sysbiolab_current_user';

let selectedRole = '';
let generatedOTP = '';
let tempUserData = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Form submission handlers
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
});

// ==================== AUTH TAB SWITCHING ====================
function switchAuthTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.form-tab').forEach(el => el.classList.remove('active'));
    
    document.getElementById(tab + 'Tab').classList.add('active');
    event.target.classList.add('active');
    
    document.getElementById('messageBox').innerHTML = '';
    
    // Reset forms and sections
    document.getElementById('loginForm').style.display = 'flex';
    document.getElementById('otpSection').style.display = 'none';
    document.getElementById('registerForm').style.display = 'flex';
    document.getElementById('regOtpSection').style.display = 'none';
    selectedRole = '';
    document.querySelectorAll('.role-option').forEach(el => el.classList.remove('selected'));
}

// ==================== MESSAGE HANDLER ====================
function showMessage(message, type = 'success') {
    const messageBox = document.getElementById('messageBox');
    messageBox.innerHTML = `<div class="${type}-message">${message}</div>`;
    setTimeout(() => {
        messageBox.innerHTML = '';
    }, 5000);
}

// ==================== OTP GENERATION ====================
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// ==================== CREATE OTP INPUT FIELDS ====================
function createOTPInputs(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    for (let i = 0; i < 6; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = '1';
        input.className = 'otp-digit';
        input.addEventListener('input', (e) => {
            if (e.target.value.length === 1 && i < 5) {
                container.children[i + 1].focus();
            }
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && e.target.value === '' && i > 0) {
                container.children[i - 1].focus();
            }
        });
        container.appendChild(input);
    }
}

// ==================== LOGIN FUNCTIONS ====================
function handleLogin(e) {
    e.preventDefault();
    const phone = document.getElementById('loginPhone').value;
    
    if (!/^\d{10}$/.test(phone)) {
        showMessage('Please enter a valid 10-digit mobile number', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS)) || [];
    const user = users.find(u => u.phone === phone);
    
    if (!user) {
        showMessage('Mobile number not registered. Please register first.', 'error');
        return;
    }
    
    // Generate and show OTP
    generatedOTP = generateOTP();
    console.log('OTP for testing:', generatedOTP);
    
    showMessage('OTP sent to your mobile number. (Test OTP: ' + generatedOTP + ')', 'success');
    
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('otpSection').style.display = 'block';
    
    createOTPInputs('otpInputs');
    tempUserData = { phone, type: 'login' };
}

function verifyOTP() {
    const otpDigits = document.querySelectorAll('#otpInputs .otp-digit');
    const enteredOTP = Array.from(otpDigits).map(input => input.value).join('');
    
    if (enteredOTP.length !== 6) {
        showMessage('Please enter all 6 digits of OTP', 'error');
        return;
    }
    
    if (enteredOTP === generatedOTP) {
        const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS)) || [];
        const user = users.find(u => u.phone === tempUserData.phone);
        
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
        showMessage('✅ Login successful! Redirecting...', 'success');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } else {
        showMessage('Invalid OTP. Please try again.', 'error');
    }
}

// ==================== REGISTRATION FUNCTIONS ====================
function selectRole(role) {
    selectedRole = role;
    document.getElementById('selectedRole').value = role;
    
    // Update visual selection
    document.querySelectorAll('.role-option').forEach(el => {
        el.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
}

function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    if (!selectedRole) {
        showMessage('Please select a role', 'error');
        return;
    }
    
    if (!/^\d{10}$/.test(phone)) {
        showMessage('Please enter a valid 10-digit mobile number', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS)) || [];
    
    if (users.find(u => u.phone === phone)) {
        showMessage('This mobile number is already registered', 'error');
        return;
    }
    
    if (users.find(u => u.email === email)) {
        showMessage('This email is already registered', 'error');
        return;
    }
    
    // Generate and show OTP
    generatedOTP = generateOTP();
    console.log('OTP for testing:', generatedOTP);
    
    showMessage('OTP sent to verify your mobile number. (Test OTP: ' + generatedOTP + ')', 'success');
    
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('regOtpSection').style.display = 'block';
    
    createOTPInputs('regOtpInputs');
    
    tempUserData = {
        name, email, phone, password, role: selectedRole, type: 'register'
    };
}

function verifyRegistrationOTP() {
    const otpDigits = document.querySelectorAll('#regOtpInputs .otp-digit');
    const enteredOTP = Array.from(otpDigits).map(input => input.value).join('');
    
    if (enteredOTP.length !== 6) {
        showMessage('Please enter all 6 digits of OTP', 'error');
        return;
    }
    
    if (enteredOTP === generatedOTP) {
        const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS)) || [];
        
        const newUser = {
            id: Date.now(),
            name: tempUserData.name,
            email: tempUserData.email,
            phone: tempUserData.phone,
            role: tempUserData.role,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
        
        // Auto-login
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(newUser));
        
        showMessage('✅ Registration successful! Redirecting to dashboard...', 'success');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } else {
        showMessage('Invalid OTP. Please try again.', 'error');
    }
}
