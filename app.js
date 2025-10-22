document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const app = document.getElementById('app');
    const modalContainer = document.getElementById('modal-container');
    const modalContent = document.getElementById('modal-content');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    // --- App State ---
    let state = {
        cars: [],
        rentals: []
    };

    // --- API Service ---
    // This object contains functions to communicate with your server.js
    const api = {
        getCars: async () => (await fetch('/api/cars')).json(),
        getRentals: async () => (await fetch('/api/rentals')).json(),
        addCar: async (carData) => fetch('/api/cars', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(carData) }),
        updateCar: async (carId, carData) => fetch(`/api/cars/${carId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(carData) }),
        deleteCar: async (carId) => fetch(`/api/cars/${carId}`, { method: 'DELETE' }),
        addRental: async (rentalData) => fetch('/api/rentals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rentalData) }),
        updateRental: async (rentalId, status) => fetch(`/api/rentals/${rentalId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }),
        addReview: async (carId, reviewData) => fetch(`/api/cars/${carId}/reviews`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reviewData) }),
        getRecommendations: async (criteria) => (await fetch('/api/recommendations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(criteria) })).json(),
    };

    // --- Toast Notifications ---
    const showToast = (message, type = 'success') => {
        toastMessage.textContent = message;
        toast.className = `toast ${type}`;
        setTimeout(() => toast.classList.add('hidden'), 3000);
    };

    // --- Modal Controls ---
    const openModal = () => modalContainer.classList.remove('hidden');
    const closeModal = () => modalContainer.classList.add('hidden');

    // --- Render Functions ---
    // (These functions build the HTML for different parts of the app)

    const renderHomePage = () => {
        app.innerHTML = `
            <h1 class="page-title">Welcome to CarMate</h1>
            <p style="font-size: 1.2rem; margin-bottom: 2rem;">Your one-stop solution for renting and buying cars with intelligent suggestions.</p>
            <a href="#rent" class="btn btn-primary" style="margin-right: 1rem;">Rent a Car</a>
            <a href="#buy" class="btn btn-secondary">Buy a Car</a>
        `;
    };

    const renderCarCard = (car, mode) => {
        const price = mode === 'rent' ? `₹${car.rentalPerDay.toLocaleString()}/day` : `₹${(car.price / 100000).toFixed(2)} Lakh`;
        return `
            <div class="car-card">
                <img src="${car.image}" alt="${car.make} ${car.model}">
                <div class="car-card-content">
                    <h3>${car.make} ${car.model}</h3>
                    <p>${car.year} &bull; ${car.fuel} &bull; ${car.type}</p>
                    <div class="card-footer">
                        <span class="price">${price}</span>
                        <button class="btn btn-primary view-details-btn" data-id="${car.id}" data-mode="${mode}">View Details</button>
                    </div>
                </div>
            </div>
        `;
    };

    const renderCarListPage = (mode) => {
        const title = mode === 'rent' ? 'Find a Car for Rent' : 'Find Your Dream Car';
        const carsToShow = state.cars.filter(car => mode === 'rent' ? car.forRent : car.forSale);
        
        app.innerHTML = `
            <h1 class="page-title">${title}</h1>
            ${mode === 'buy' ? `
                <div class="form-section">
                    <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">Get Personalized Recommendations</h2>
                    <form id="recommendation-form" class="form-grid">
                        <div class="form-group">
                            <label for="budget">Max Budget (in ₹)</label>
                            <input type="number" id="budget" name="budget" placeholder="e.g., 1000000">
                        </div>
                        <div class="form-group">
                            <label for="usage">Primary Usage</label>
                            <select id="usage" name="usage">
                                <option value="any">Any</option>
                                <option value="daily">Daily Commute</option>
                                <option value="family">Family Trips</option>
                                <option value="luxury">Luxury / Performance</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-secondary">Find My Car</button>
                    </form>
                </div>` : ''}
            <div id="car-list-grid" class="card-grid">
                ${carsToShow.length ? carsToShow.map(car => renderCarCard(car, mode)).join('') : '<p>No cars available for this category.</p>'}
            </div>
        `;
    };
    
    const renderAdminPage = () => {
        app.innerHTML = `
            <h1 class="page-title">Admin Panel</h1>
            <div class="admin-grid">
                <div class="form-section">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h2>Manage Inventory</h2>
                        <button id="add-car-btn" class="btn btn-primary">Add New Car</button>
                    </div>
                    <div id="admin-car-list">
                        </div>
                </div>
                <div class="form-section">
                    <h2>Rental Requests</h2>
                    <div id="admin-rental-list">
                        </div>
                </div>
            </div>
        `;
        renderAdminCarList();
        renderAdminRentalList();
    };
    
    const renderAdminCarList = () => {
        const listEl = document.getElementById('admin-car-list');
        if (!listEl) return;
        listEl.innerHTML = state.cars.map(car => `
            <div class="admin-list-item">
                <div>
                    <strong>${car.make} ${car.model}</strong>
                    <p class="text-light">ID: ${car.id}</p>
                </div>
                <div>
                    <button class="btn btn-warning edit-car-btn" data-id="${car.id}">Edit</button>
                    <button class="btn btn-danger delete-car-btn" data-id="${car.id}">Delete</button>
                </div>
            </div>
        `).join('');
    };
    
    const renderAdminRentalList = () => {
        const listEl = document.getElementById('admin-rental-list');
        if (!listEl) return;
        listEl.innerHTML = state.rentals.map(rental => {
            const car = state.cars.find(c => c.id === rental.carId);
            return `
                <div class="admin-list-item">
                    <div>
                        <strong>${car ? car.make : 'Unknown'} ${car ? car.model : 'Car'}</strong>
                        <p class="text-light">${rental.startDate} to ${rental.endDate} | Status: ${rental.status}</p>
                    </div>
                    ${rental.status === 'Pending' ? `
                    <div>
                        <button class="btn btn-secondary rental-action-btn" data-id="${rental.id}" data-action="Approved">Approve</button>
                        <button class="btn btn-danger rental-action-btn" data-id="${rental.id}" data-action="Declined">Decline</button>
                    </div>` : ''}
                </div>
            `;
        }).join('');
    };

    // --- Modal Content Renderers ---
    
    const renderCarDetailModal = (car, mode) => {
        const price = mode === 'rent' ? `₹${car.rentalPerDay.toLocaleString()}/day` : `₹${(car.price / 100000).toFixed(2)} Lakh`;
        modalContent.innerHTML = `
            <button class="modal-close-btn">&times;</button>
            <h2 style="font-size: 2rem; margin-bottom: 1rem;">${car.make} ${car.model}</h2>
            <img src="${car.image}" style="width:100%; height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;">
            
            <p style="margin-bottom: 1rem;">${car.year} &bull; ${car.fuel} &bull; ${car.type}</p>
            
            <h3>User Reviews</h3>
            <div id="review-list" style="max-height: 150px; overflow-y: auto; border: 1px solid var(--border-color); padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
                ${car.reviews && car.reviews.length > 0 ? car.reviews.map(r => `
                    <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
                        <strong>${r.user}</strong> - <span>${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
                        <p>${r.comment}</p>
                    </div>`).join('') : '<p>No reviews yet.</p>'}
            </div>
            
            <div class="form-section">
                <h3>Leave a Review</h3>
                <form id="review-form" class="form-grid" data-id="${car.id}">
                    <div class="form-group"><input type="text" name="user" placeholder="Your Name" required></div>
                    <div class="form-group">
                        <select name="rating" required><option value="">Rating</option><option value="5">5 Stars</option><option value="4">4</option><option value="3">3</option><option value="2">2</option><option value="1">1</option></select>
                    </div>
                    <div class="form-group" style="grid-column: 1 / -1;"><textarea name="comment" placeholder="Your comment..." required></textarea></div>
                    <button type="submit" class="btn btn-primary">Submit Review</button>
                </form>
            </div>
            
             ${mode === 'rent' ? `
                <div class="form-section">
                    <h3>Request to Rent this Car (${price})</h3>
                    <form id="rental-form" class="form-grid" data-id="${car.id}">
                         <div class="form-group"><label>Start Date</label><input type="date" name="startDate" required></div>
                         <div class="form-group"><label>End Date</label><input type="date" name="endDate" required></div>
                         <button type="submit" class="btn btn-primary">Submit Request</button>
                    </form>
                </div>
            ` : `<div class="form-section"><button class="btn btn-secondary" style="width: 100%;">Contact Seller to Buy for ${price}</button></div>`}
        `;
        openModal();
    };

    const renderCarFormModal = (car = {}) => {
        const isEditing = !!car.id;
        modalContent.innerHTML = `
            <button class="modal-close-btn">&times;</button>
            <h2>${isEditing ? 'Edit Car' : 'Add New Car'}</h2>
            <form id="car-form" data-id="${car.id || ''}" class="form-grid" style="grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                <div class="form-group"><label>Make</label><input type="text" name="make" value="${car.make || ''}" required></div>
                <div class="form-group"><label>Model</label><input type="text" name="model" value="${car.model || ''}" required></div>
                <div class="form-group"><label>Year</label><input type="number" name="year" value="${car.year || ''}" required></div>
                <div class="form-group"><label>Type</label><input type="text" name="type" value="${car.type || ''}" required></div>
                <div class="form-group"><label>Fuel</label><input type="text" name="fuel" value="${car.fuel || ''}" required></div>
                <div class="form-group"><label>Price (₹)</label><input type="number" name="price" value="${car.price || ''}" required></div>
                <div class="form-group"><label>Rental/Day (₹)</label><input type="number" name="rentalPerDay" value="${car.rentalPerDay || ''}" required></div>
                <div class="form-group" style="grid-column: 1 / -1;"><label>Image URL</label><input type="text" name="image" value="${car.image || ''}" required></div>
                <div class="form-group" style="grid-column: 1 / -1; display: flex; gap: 2rem;">
                    <label><input type="checkbox" name="forSale" ${car.forSale ? 'checked' : ''}> For Sale</label>
                    <label><input type="checkbox" name="forRent" ${car.forRent ? 'checked' : ''}> For Rent</label>
                </div>
                <button type="submit" class="btn btn-primary" style="grid-column: 1 / -1;">${isEditing ? 'Update Car' : 'Add Car'}</button>
            </form>
        `;
        openModal();
    };

    // --- Event Handlers ---
    
    const handleNavClick = (hash) => {
        // Update active link in navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active-nav', link.getAttribute('href') === hash);
        });
        // Render the correct page content based on the hash
        switch (hash) {
            case '#rent': renderCarListPage('rent'); break;
            case '#buy': renderCarListPage('buy'); break;
            case '#admin': renderAdminPage(); break;
            case '#home': default: renderHomePage();
        }
    };
    
    // Main event listener for clicks on the <main> app area
    async function handleAppClick(e) {
        // View Details
        if (e.target.matches('.view-details-btn')) {
            const carId = parseInt(e.target.dataset.id);
            const mode = e.target.dataset.mode;
            const car = state.cars.find(c => c.id === carId);
            renderCarDetailModal(car, mode);
        }
        // Add Car
        if (e.target.matches('#add-car-btn')) {
            renderCarFormModal();
        }
        // Edit Car
        if (e.target.matches('.edit-car-btn')) {
            const carId = parseInt(e.target.dataset.id);
            const car = state.cars.find(c => c.id === carId);
            renderCarFormModal(car);
        }
        // Delete Car
        if (e.target.matches('.delete-car-btn')) {
            const carId = parseInt(e.target.dataset.id);
            if (confirm('Are you sure you want to delete this car?')) {
                await api.deleteCar(carId);
                await refreshData(); // Refresh local state from server
                renderAdminCarList(); // Re-render the admin list
                showToast('Car deleted successfully', 'error');
            }
        }
        // Rental Action (Approve/Decline)
        if (e.target.matches('.rental-action-btn')) {
            const rentalId = parseInt(e.target.dataset.id);
            const action = e.target.dataset.action;
            await api.updateRental(rentalId, action);
            await refreshData();
            renderAdminRentalList();
            showToast(`Rental ${action.toLowerCase()}`);
        }
    }

    // Main event listener for form submissions inside the modal
    async function handleModalSubmit(e) {
        e.preventDefault();
        
        // Car Form (Add/Edit)
        if (e.target.matches('#car-form')) {
            const form = e.target;
            const carId = form.dataset.id;
            const carData = {
                id: carId ? parseInt(carId) : null,
                make: form.make.value, model: form.model.value, year: parseInt(form.year.value),
                type: form.type.value, fuel: form.fuel.value, price: parseFloat(form.price.value),
                rentalPerDay: parseFloat(form.rentalPerDay.value), image: form.image.value,
                forSale: form.forSale.checked, forRent: form.forRent.checked
            };
            if (carId) {
                await api.updateCar(carId, carData);
            } else {
                await api.addCar(carData);
            }
            await refreshData();
            renderAdminCarList();
            closeModal();
            showToast(carId ? 'Car updated successfully' : 'Car added successfully');
        }

        // Rental Form
        if (e.target.matches('#rental-form')) {
            const form = e.target;
            const rentalData = {
                carId: parseInt(form.dataset.id),
                startDate: form.startDate.value,
                endDate: form.endDate.value,
            };
            // Simple date validation
            if (rentalData.endDate <= rentalData.startDate) {
                showToast('End date must be after start date', 'error');
                return;
            }
            await api.addRental(rentalData);
            await refreshData();
            closeModal();
            showToast('Rental request submitted!');
        }
        
        // Review Form
        if (e.target.matches('#review-form')) {
            const form = e.target;
            const carId = parseInt(form.dataset.id);
            const reviewData = {
                user: form.user.value, rating: parseInt(form.rating.value), comment: form.comment.value,
            };
            await api.addReview(carId, reviewData);
            await refreshData();
            const car = state.cars.find(c => c.id === carId);
            renderCarDetailModal(car, 'rent'); // Re-render modal to show new review
            showToast('Review submitted!');
        }
    }
    
    // Event handler for the recommendation form
    async function handleRecommendationSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const criteria = {
            budget: form.budget.value ? parseFloat(form.budget.value) : null,
            usage: form.usage.value
        };
        const recommendedCars = await api.getRecommendations(criteria);
        const grid = document.getElementById('car-list-grid');
        grid.innerHTML = recommendedCars.length ? recommendedCars.map(car => renderCarCard(car, 'buy')).join('') : '<p>No recommendations match your criteria.</p>';
        showToast(`${recommendedCars.length} recommendations found!`);
    }

    // --- Router and Initializer ---
    
    // This function handles navigation when the URL hash changes
    const router = () => {
        handleNavClick(window.location.hash || '#home');
    };
    
    // This function fetches the latest data from the server and updates the state
    const refreshData = async () => {
        [state.cars, state.rentals] = await Promise.all([api.getCars(), api.getRentals()]);
    };
    
    // This function runs once when the page loads
    const init = async () => {
        // Event Listeners
        window.addEventListener('hashchange', router); // For navigation
        app.addEventListener('click', handleAppClick); // For clicks on dynamic content
        modalContainer.addEventListener('submit', handleModalSubmit); // For form submissions in the modal
        modalContent.addEventListener('click', (e) => { if (e.target.matches('.modal-close-btn')) closeModal(); });
        mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
        mobileMenu.addEventListener('click', () => mobileMenu.classList.add('hidden')); // Close mobile menu on link click
        app.addEventListener('submit', (e) => { if (e.target.matches('#recommendation-form')) handleRecommendationSubmit(e); });

        // Initial Load
        await refreshData(); // Get data from server
        router(); // Render the initial page
    };

    init(); // Start the application
});