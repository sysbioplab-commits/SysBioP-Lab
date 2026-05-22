// Local storage keys
const STORAGE_KEY_INTERNSHIPS = 'sysbiolab_internships';
const STORAGE_KEY_EQUIPMENT = 'sysbiolab_equipment';
const STORAGE_KEY_SUPPLIES = 'sysbiolab_supplies';

let isLoggedIn = false;

// ==================== LOGIN FUNCTIONALITY ====================
document.getElementById('loginBtn').addEventListener('click', function() {
    document.getElementById('loginModal').style.display = 'block';
});

document.querySelector('.close').addEventListener('click', function() {
    document.getElementById('loginModal').style.display = 'none';
});

window.addEventListener('click', function(event) {
    const modal = document.getElementById('loginModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    // Simple login - in production, use proper authentication
    isLoggedIn = true;
    document.getElementById('loginModal').style.display = 'none';
    
    // Show admin buttons
    document.getElementById('adminInternshipBtn').style.display = 'block';
    document.getElementById('adminEquipBtn').style.display = 'block';
    document.getElementById('adminSupplyBtn').style.display = 'block';
    
    // Change login button
    document.getElementById('loginBtn').textContent = 'Logout';
    document.getElementById('loginBtn').addEventListener('click', logout);
    
    alert('Logged in successfully!');
    this.reset();
});

function logout() {
    isLoggedIn = false;
    document.getElementById('adminInternshipBtn').style.display = 'none';
    document.getElementById('adminEquipBtn').style.display = 'none';
    document.getElementById('adminSupplyBtn').style.display = 'none';
    document.getElementById('loginBtn').textContent = 'Login';
    alert('Logged out successfully!');
}

// ==================== INTERNSHIP FUNCTIONALITY ====================
function openInternshipForm() {
    document.getElementById('internshipForm').style.display = 'block';
}

function closeInternshipForm() {
    document.getElementById('internshipForm').style.display = 'none';
    document.getElementById('newInternshipForm').reset();
}

document.getElementById('newInternshipForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const internship = {
        id: Date.now(),
        name: this.querySelector('input:nth-of-type(1)').value,
        school: this.querySelector('input:nth-of-type(2)').value,
        project: this.querySelector('input:nth-of-type(3)').value,
        duration: this.querySelector('input:nth-of-type(4)').value,
        stipend: this.querySelector('input:nth-of-type(5)').value,
        description: this.querySelector('textarea').value,
        imageUrl: this.querySelector('input:nth-of-type(6)').value
    };
    
    let internships = JSON.parse(localStorage.getItem(STORAGE_KEY_INTERNSHIPS)) || [];
    internships.push(internship);
    localStorage.setItem(STORAGE_KEY_INTERNSHIPS, JSON.stringify(internships));
    
    this.reset();
    closeInternshipForm();
    loadInternships();
    alert('Internship record added successfully!');
});

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
                ${isLoggedIn ? `<button onclick="deleteInternship(${internship.id})" style="background-color: #e74c3c; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; margin-top: 0.5rem;">Delete</button>` : ''}
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
    }
}

// ==================== EQUIPMENT FUNCTIONALITY ====================
function openEquipmentForm() {
    document.getElementById('equipmentForm').style.display = 'block';
}

function closeEquipmentForm() {
    document.getElementById('equipmentForm').style.display = 'none';
    document.getElementById('newEquipmentForm').reset();
}

document.getElementById('newEquipmentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const equipment = {
        id: Date.now(),
        name: this.querySelector('input:nth-of-type(1)').value,
        description: this.querySelector('textarea').value,
        model: this.querySelector('input:nth-of-type(2)').value,
        status: this.querySelector('input:nth-of-type(3)').value
    };
    
    let equipments = JSON.parse(localStorage.getItem(STORAGE_KEY_EQUIPMENT)) || [];
    equipments.push(equipment);
    localStorage.setItem(STORAGE_KEY_EQUIPMENT, JSON.stringify(equipments));
    
    this.reset();
    closeEquipmentForm();
    loadEquipment();
    alert('Equipment added successfully!');
});

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
                ${isLoggedIn ? `<button onclick="deleteEquipment(${equipment.id})" style="margin-left: 0.5rem; background-color: #e74c3c; color: white; padding: 0.25rem 0.5rem; border: none; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">Delete</button>` : ''}
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
    }
}

// ==================== SUPPLIES FUNCTIONALITY ====================
function openSupplyForm() {
    document.getElementById('supplyForm').style.display = 'block';
}

function closeSupplyForm() {
    document.getElementById('supplyForm').style.display = 'none';
    document.getElementById('newSupplyForm').reset();
}

document.getElementById('newSupplyForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const supply = {
        id: Date.now(),
        name: this.querySelector('input:nth-of-type(1)').value,
        category: this.querySelector('select').value,
        quantity: this.querySelector('input:nth-of-type(2)').value,
        status: this.querySelector('input:nth-of-type(3)').value,
        notes: this.querySelector('textarea').value
    };
    
    let supplies = JSON.parse(localStorage.getItem(STORAGE_KEY_SUPPLIES)) || [];
    supplies.push(supply);
    localStorage.setItem(STORAGE_KEY_SUPPLIES, JSON.stringify(supplies));
    
    this.reset();
    closeSupplyForm();
    loadSupplies();
    alert('Supply item added successfully!');
});

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
                    </div>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <span class="supply-item-status ${statusClass}">${supply.status}</span>
                        ${isLoggedIn ? `<button onclick="deleteSupply(${supply.id})" style="background-color: #e74c3c; color: white; padding: 0.25rem 0.5rem; border: none; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">Delete</button>` : ''}
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
    }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    loadInternships();
    loadEquipment();
    loadSupplies();
});
