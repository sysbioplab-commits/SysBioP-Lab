// Local storage keys
const STORAGE_KEY_INTERNSHIPS = 'sysbiolab_internships';
const STORAGE_KEY_EQUIPMENT = 'sysbiolab_equipment';
const STORAGE_KEY_SUPPLIES = 'sysbiolab_supplies';
const STORAGE_KEY_USERS = 'sysbiolab_users';
const STORAGE_KEY_CURRENT_USER = 'sysbiolab_current_user';

let currentUser = null;
let selectedRole = '';
let generatedOTP = '';
let tempUserData = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedUser = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showUserInfo();
        updateAdminButtons();
    }
    
    loadInternships();
    loadEquipment();
    loadSupplies();
    loadUsers();
    
    // Form submission handlers
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('newInternshipForm').addEventListener('submit', addInternship);
    document.getElementById('newEquipmentForm').addEventListener('submit', addEquipment);
    document.getElementById('newSupplyForm').addEventListener('submit', addSupply);
});

// ==================== AUTH FUNCTIONS ====================
function showAuthModal() {
    if (currentUser) {
        return;
    }
    document.getElementById('authModal').style.display = 'block';
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
    document.getElementById('messageBox').innerHTML = '';
}

window.addEventListener('click', function(event) {
    const modal = document.getElementById('authModal');
    if (event.target === modal) {
        closeAuthModal();
    }
});

function switchAuthTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.form-tab').forEach(el => el.classList.remove('active'));
    
    document.getElementById(tab + 'Tab').classList.add('active');
    event.target.classList.add('active');
    
    document.getElementById('messageBox').innerHTML = '';
}

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function showMessage(message, type = 'success') {
    const messageBox = document.getElementById('messageBox');
    messageBox.innerHTML = `<div class="${type}-message">${message}</div>`;
    setTimeout(() => {
        messageBox.innerHTML = '';
    }, 5000);
}

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
    
    // Generate and show OTP (in real app, send via SMS)
    generatedOTP = generateOTP();
    console.log('OTP for testing:', generatedOTP); // For testing purposes
    
    showMessage('OTP sent to your mobile number. (Test OTP: ' + generatedOTP + ')', 'success');
    
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('otpSection').style.display = 'block';
    
    // Create OTP input fields
    const otpContainer = document.getElementById('otpInputs');
    otpContainer.innerHTML = '';
    for (let i = 0; i < 6; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = '1';
        input.class = 'otp-digit';
        input.className = 'otp-digit';
        input.addEventListener('input', (e) => {
            if (e.target.value.length === 1 && i < 5) {
                otpContainer.children[i + 1].focus();
            }
        });
        otpContainer.appendChild(input);
    }
    
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
        
        currentUser = user;
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(currentUser));
        
        closeAuthModal();
        showUserInfo();
        updateAdminButtons();
        loadUsers();
        
        showMessage('✅ Login successful! Welcome ' + user.name, 'success');
    } else {
        showMessage('Invalid OTP. Please try again.', 'error');
    }
}

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
    
    // Generate and show OTP for registration
    generatedOTP = generateOTP();
    console.log('OTP for testing:', generatedOTP); // For testing purposes
    
    showMessage('OTP sent to verify your mobile number. (Test OTP: ' + generatedOTP + ')', 'success');
    
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('regOtpSection').style.display = 'block';
    
    // Create OTP input fields
    const otpContainer = document.getElementById('regOtpInputs');
    otpContainer.innerHTML = '';
    for (let i = 0; i < 6; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = '1';
        input.className = 'otp-digit';
        input.addEventListener('input', (e) => {
            if (e.target.value.length === 1 && i < 5) {
                otpContainer.children[i + 1].focus();
            }
        });
        otpContainer.appendChild(input);
    }
    
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
        currentUser = newUser;
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(currentUser));
        
        // Reset form
        document.getElementById('registerForm').reset();
        document.getElementById('registerForm').style.display = 'block';
        document.getElementById('regOtpSection').style.display = 'none';
        selectedRole = '';
        
        closeAuthModal();
        showUserInfo();
        updateAdminButtons();
        loadUsers();
        
        showMessage('✅ Registration successful! Welcome ' + newUser.name, 'success');
    } else {
        showMessage('Invalid OTP. Please try again.', 'error');
    }
}

function showUserInfo() {
    if (currentUser) {
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('userInfo').style.display = 'flex';
        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('userRole').textContent = currentUser.role;
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
        
        document.getElementById('loginBtn').style.display = 'block';
        document.getElementById('userInfo').style.display = 'none';
        document.getElementById('adminInternshipBtn').style.display = 'none';
        document.getElementById('adminEquipBtn').style.display = 'none';
        document.getElementById('adminSupplyBtn').style.display = 'none';
        
        loadUsers();
        showMessage('✅ Logged out successfully', 'success');
    }
}

function updateAdminButtons() {
    if (currentUser && (currentUser.role === 'Professor' || currentUser.role === 'Scholar')) {
        document.getElementById('adminInternshipBtn').style.display = 'block';
        document.getElementById('adminEquipBtn').style.display = 'block';
        document.getElementById('adminSupplyBtn').style.display = 'block';
    } else {
        document.getElementById('adminInternshipBtn').style.display = 'none';
        document.getElementById('adminEquipBtn').style.display = 'none';
        document.getElementById('adminSupplyBtn').style.display = 'none';
    }
}

// ==================== USERS MANAGEMENT ====================
function loadUsers() {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS)) || [];
    const usersGrid = document.getElementById('usersGrid');
    const usersSection = document.getElementById('usersSection');
    
    if (users.length === 0) {
        usersSection.style.display = 'none';
        return;
    }
    
    usersSection.style.display = 'block';
    usersGrid.innerHTML = '';
    
    users.forEach(user => {
        const userCard = document.createElement('div');
        userCard.className = 'user-card';
        
        const roleEmoji = {
            'Professor': '👨‍🏫',
            'Scholar': '👨‍🎓',
            'Intern': '👨‍💼',
            'Student': '👨‍🎒'
        };
        
        userCard.innerHTML = `
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">${roleEmoji[user.role] || '👤'}</div>
            <h4>${user.name}</h4>
            <span class="user-role">${user.role}</span>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Phone:</strong> +91 ${user.phone}</p>
            <p><strong>Joined:</strong> ${new Date(user.createdAt).toLocaleDateString('en-IN')}</p>
        `;
        
        usersGrid.appendChild(userCard);
    });
}

// ==================== INTERNSHIP FUNCTIONALITY ====================
function openInternshipForm() {
    if (!currentUser) {
        showMessage('Please login first', 'error');
        return;
    }
    document.getElementById('internshipForm').style.display = 'block';
}

function closeInternshipForm() {
    document.getElementById('internshipForm').style.display = 'none';
    document.getElementById('newInternshipForm').reset();
}

function addInternship(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showMessage('Please login first', 'error');
        return;
    }
    
    const internship = {
        id: Date.now(),
        name: this.querySelector('input:nth-of-type(1)').value,
        school: this.querySelector('input:nth-of-type(2)').value,
        project: this.querySelector('input:nth-of-type(3)').value,
        duration: this.querySelector('input:nth-of-type(4)').value,
        stipend: this.querySelector('input:nth-of-type(5)').value,
        description: this.querySelector('textarea').value,
        imageUrl: this.querySelector('input:nth-of-type(6)').value,
        addedBy: currentUser.name,
        addedAt: new Date().toISOString()
    };
    
    let internships = JSON.parse(localStorage.getItem(STORAGE_KEY_INTERNSHIPS)) || [];
    internships.push(internship);
    localStorage.setItem(STORAGE_KEY_INTERNSHIPS, JSON.stringify(internships));
    
    this.reset();
    closeInternshipForm();
    loadInternships();
    showMessage('✅ Internship record added successfully!', 'success');
}

function loadInternships() {
    const internships = JSON.parse(localStorage.getItem(STORAGE_KEY_INTERNSHIPS)) || [];
    const gallery = document.getElementById('internshipGallery');
    
    gallery.innerHTML = '';
    
    if (internships.length === 0) {
        gallery.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No internship records yet.</p>';
        return;
    }
    
    internships.forEach(internship => {
        const card = document.createElement('div');
        card.className = 'internship-card';
        card.innerHTML = `
            <div class="internship-image">
                ${internship.imageUrl ? `<img src="${internship.imageUrl}" alt="${internship.name}">` : '🎓'}
            </div>
            <div class="internship-content">
                <h4>${internship.name}</h4>
                <div class="school">${internship.school}</div>
                <div><strong>Project:</strong> ${internship.project}</div>
                <div class="duration">📅 ${internship.duration}</div>
                ${internship.stipend ? `<div class="stipend">Stipend: ₹${internship.stipend}</div>` : ''}
                <p>${internship.description}</p>
                <div style="font-size: 0.8rem; color: #999; margin-top: 0.5rem;">Added by: ${internship.addedBy}</div>
                ${currentUser && (currentUser.role === 'Professor' || currentUser.role === 'Scholar') ? `<button onclick="deleteInternship(${internship.id})" style="background-color: #e74c3c; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; margin-top: 0.5rem;">Delete</button>` : ''}
            </div>
        `;
        gallery.appendChild(card);
    });
}

function deleteInternship(id) {
    if (confirm('Are you sure you want to delete this record?')) {
        let internships = JSON.parse(localStorage.getItem(STORAGE_KEY_INTERNSHIPS)) || [];
        internships = internships.filter(i => i.id !== id);
        localStorage.setItem(STORAGE_KEY_INTERNSHIPS, JSON.stringify(internships));
        loadInternships();
        showMessage('✅ Record deleted successfully', 'success');
    }
}

// ==================== EQUIPMENT FUNCTIONALITY ====================
function openEquipmentForm() {
    if (!currentUser) {
        showMessage('Please login first', 'error');
        return;
    }
    document.getElementById('equipmentForm').style.display = 'block';
}

function closeEquipmentForm() {
    document.getElementById('equipmentForm').style.display = 'none';
    document.getElementById('newEquipmentForm').reset();
}

function addEquipment(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showMessage('Please login first', 'error');
        return;
    }
    
    const equipment = {
        id: Date.now(),
        name: this.querySelector('input:nth-of-type(1)').value,
        description: this.querySelector('textarea').value,
        model: this.querySelector('input:nth-of-type(2)').value,
        status: this.querySelector('input:nth-of-type(3)').value,
        addedBy: currentUser.name,
        addedAt: new Date().toISOString()
    };
    
    let equipments = JSON.parse(localStorage.getItem(STORAGE_KEY_EQUIPMENT)) || [];
    equipments.push(equipment);
    localStorage.setItem(STORAGE_KEY_EQUIPMENT, JSON.stringify(equipments));
    
    this.reset();
    closeEquipmentForm();
    loadEquipment();
    showMessage('✅ Equipment added successfully!', 'success');
}

function loadEquipment() {
    const equipments = JSON.parse(localStorage.getItem(STORAGE_KEY_EQUIPMENT)) || [];
    const tbody = document.getElementById('equipmentBody');
    
    tbody.innerHTML = '';
    
    if (equipments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #999;">No equipment records yet.</td></tr>';
        return;
    }
    
    equipments.forEach(equipment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${equipment.name}</strong></td>
            <td>${equipment.description}</td>
            <td>${equipment.model}</td>
            <td>
                <span style="padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.85rem; 
                    ${equipment.status === 'Available' ? 'background-color: #d4edda; color: #155724;' : 
                      equipment.status === 'In Use' ? 'background-color: #fff3cd; color: #856404;' : 
                      'background-color: #f8d7da; color: #721c24;'}">
                    ${equipment.status}
                </span>
                ${currentUser && (currentUser.role === 'Professor' || currentUser.role === 'Scholar') ? `<button onclick="deleteEquipment(${equipment.id})" style="margin-left: 0.5rem; background-color: #e74c3c; color: white; padding: 0.25rem 0.5rem; border: none; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">Delete</button>` : ''}
            </td>
        `;
        tbody.appendChild(row);
    });
}

function deleteEquipment(id) {
    if (confirm('Are you sure you want to delete this equipment?')) {
        let equipments = JSON.parse(localStorage.getItem(STORAGE_KEY_EQUIPMENT)) || [];
        equipments = equipments.filter(e => e.id !== id);
        localStorage.setItem(STORAGE_KEY_EQUIPMENT, JSON.stringify(equipments));
        loadEquipment();
        showMessage('✅ Equipment deleted successfully', 'success');
    }
}

// ==================== SUPPLIES FUNCTIONALITY ====================
function openSupplyForm() {
    if (!currentUser) {
        showMessage('Please login first', 'error');
        return;
    }
    document.getElementById('supplyForm').style.display = 'block';
}

function closeSupplyForm() {
    document.getElementById('supplyForm').style.display = 'none';
    document.getElementById('newSupplyForm').reset();
}

function addSupply(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showMessage('Please login first', 'error');
        return;
    }
    
    const supply = {
        id: Date.now(),
        name: this.querySelector('input:nth-of-type(1)').value,
        category: this.querySelector('select').value,
        quantity: this.querySelector('input:nth-of-type(2)').value,
        status: this.querySelector('input:nth-of-type(3)').value,
        notes: this.querySelector('textarea').value,
        addedBy: currentUser.name,
        addedAt: new Date().toISOString()
    };
    
    let supplies = JSON.parse(localStorage.getItem(STORAGE_KEY_SUPPLIES)) || [];
    supplies.push(supply);
    localStorage.setItem(STORAGE_KEY_SUPPLIES, JSON.stringify(supplies));
    
    this.reset();
    closeSupplyForm();
    loadSupplies();
    showMessage('✅ Supply item added successfully!', 'success');
}

function loadSupplies() {
    const supplies = JSON.parse(localStorage.getItem(STORAGE_KEY_SUPPLIES)) || [];
    const container = document.getElementById('suppliesContainer');
    
    container.innerHTML = '';
    
    if (supplies.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; grid-column: 1/-1;">No supply records yet.</p>';
        return;
    }
    
    const categories = ['Glassware', 'Plastic Wares', 'Media', 'Reagents', 'Other'];
    
    categories.forEach(category => {
        const categorySupplies = supplies.filter(s => s.category === category);
        
        if (categorySupplies.length === 0) return;
        
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'supply-category';
        
        let categoryHTML = `
            <div class="supply-category-header">
                ${category}
                <span style="float: right; font-size: 0.9rem;">(${categorySupplies.length} items)</span>
            </div>
            <div class="supply-list">
        `;
        
        categorySupplies.forEach(supply => {
            let statusClass = '';
            if (supply.status === 'Available') statusClass = 'status-available';
            else if (supply.status === 'Low Stock') statusClass = 'status-low';
            else statusClass = 'status-used';
            
            categoryHTML += `
                <div class="supply-item">
                    <div class="supply-item-info">
                        <h5>${supply.name}</h5>
                        <div class="quantity">Qty: ${supply.quantity}</div>
                        ${supply.notes ? `<div style="font-size: 0.85rem; color: #666; margin-top: 0.25rem;">${supply.notes}</div>` : ''}
                        <div style="font-size: 0.75rem; color: #999; margin-top: 0.25rem;">Added by: ${supply.addedBy}</div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <span class="supply-item-status ${statusClass}">${supply.status}</span>
                        ${currentUser && (currentUser.role === 'Professor' || currentUser.role === 'Scholar') ? `<button onclick="deleteSupply(${supply.id})" style="background-color: #e74c3c; color: white; padding: 0.25rem 0.5rem; border: none; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">Delete</button>` : ''}
                    </div>
                </div>
            `;
        });
        
        categoryHTML += '</div>';
        categoryDiv.innerHTML = categoryHTML;
        container.appendChild(categoryDiv);
    });
}

function deleteSupply(id) {
    if (confirm('Are you sure you want to delete this supply?')) {
        let supplies = JSON.parse(localStorage.getItem(STORAGE_KEY_SUPPLIES)) || [];
        supplies = supplies.filter(s => s.id !== id);
        localStorage.setItem(STORAGE_KEY_SUPPLIES, JSON.stringify(supplies));
        loadSupplies();
        showMessage('✅ Supply deleted successfully', 'success');
    }
}
