// API Base URL - Replace with your Railway backend URL
const API_BASE_URL = 'https://your-railway-app.up.railway.app/api';

// Load products from database
async function loadProducts(category = 'all') {
    try {
        const response = await fetch(`${API_BASE_URL}/get-products.php`);
        const products = await response.json();
        
        const productsList = document.getElementById('productsList');
        if (!productsList) return;
        
        if (products.error) {
            productsList.innerHTML = '<div class="message error">Error loading products</div>';
            return;
        }
        
        const filteredProducts = category === 'all' 
            ? products 
            : products.filter(product => product.category === category);
        
        if (filteredProducts.length === 0) {
            productsList.innerHTML = '<div class="message">No products found</div>';
            return;
        }
        
        productsList.innerHTML = filteredProducts.map(product => `
            <div class="product-card" data-category="${product.category}">
                <h4>${product.name}</h4>
                <p>${product.description}</p>
                <div class="product-price">$${product.price}</div>
                <div class="product-category">${product.category}</div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('productsList').innerHTML = 
            '<div class="message error">Error loading products</div>';
    }
}

// Handle order form submission
document.addEventListener('DOMContentLoaded', function() {
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const orderData = {
                customerName: formData.get('customerName'),
                customerEmail: formData.get('customerEmail'),
                productCategory: formData.get('productCategory'),
                productDetails: formData.get('productDetails'),
                budget: formData.get('budget'),
                deadline: formData.get('deadline'),
                status: 'pending',
                orderDate: new Date().toISOString()
            };
            
            try {
                const response = await fetch(`${API_BASE_URL}/create-order.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(orderData)
                });
                
                const result = await response.json();
                const messageDiv = document.getElementById('orderMessage');
                
                if (result.success) {
                    messageDiv.className = 'message success';
                    messageDiv.textContent = 'Order placed successfully! We will contact you soon.';
                    orderForm.reset();
                } else {
                    messageDiv.className = 'message error';
                    messageDiv.textContent = 'Error placing order. Please try again.';
                }
                
                messageDiv.style.display = 'block';
                
            } catch (error) {
                console.error('Error:', error);
                const messageDiv = document.getElementById('orderMessage');
                messageDiv.className = 'message error';
                messageDiv.textContent = 'Network error. Please check your connection.';
                messageDiv.style.display = 'block';
            }
        });
    }
    
    // Filter products
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter products
            loadProducts(category);
        });
    });
    
    // Load products on page load
    if (document.getElementById('productsList')) {
        loadProducts();
    }
    
    // Load orders in admin panel
    if (document.getElementById('ordersList')) {
        loadOrders();
    }
});

// Load orders for admin panel
async function loadOrders() {
    try {
        const response = await fetch(`${API_BASE_URL}/get-orders.php`);
        const orders = await response.json();
        
        const ordersList = document.getElementById('ordersList');
        if (!ordersList) return;
        
        if (orders.error) {
            ordersList.innerHTML = '<div class="message error">Error loading orders</div>';
            return;
        }
        
        if (orders.length === 0) {
            ordersList.innerHTML = '<div class="message">No orders yet</div>';
            return;
        }
        
        ordersList.innerHTML = orders.map(order => `
            <div class="order-item">
                <div class="order-header">
                    <h4>${order.customerName} - ${order.productCategory}</h4>
                    <span class="order-status status-${order.status}">${order.status}</span>
                </div>
                <p><strong>Email:</strong> ${order.customerEmail}</p>
                <p><strong>Budget:</strong> ${order.budget}</p>
                <p><strong>Deadline:</strong> ${order.deadline || 'Not specified'}</p>
                <p><strong>Details:</strong> ${order.productDetails}</p>
                <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
            </div>
        `).join('');
        
        // Update stats
        updateOrderStats(orders);
        
    } catch (error) {
        console.error('Error loading orders:', error);
        document.getElementById('ordersList').innerHTML = 
            '<div class="message error">Error loading orders</div>';
    }
}

// Update order statistics
function updateOrderStats(orders) {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('completedOrders').textContent = completedOrders;
}

// Add sample products (for admin)
async function addSampleProducts() {
    const sampleProducts = [
        {
            name: "Logo Design Package",
            description: "Professional logo design with 3 concepts and source files",
            category: "design",
            price: 150
        },
        {
            name: "Website Development",
            description: "Custom responsive website with CMS integration",
            category: "software",
            price: 800
        },
        {
            name: "UI/UX Design",
            description: "User interface and experience design for web/mobile apps",
            category: "design",
            price: 300
        },
        {
            name: "Mobile App Development",
            description: "Cross-platform mobile application development",
            category: "software",
            price: 1200
        },
        {
            name: "Tech Consultation",
            description: "1-hour technology consultation session",
            category: "service",
            price: 50
        },
        {
            name: "2D Animation Video",
            description: "60-second 2D animated explainer video",
            category: "animation",
            price: 500
        }
    ];
    
    try {
        for (const product of sampleProducts) {
            await fetch(`${API_BASE_URL}/add-product.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(product)
            });
        }
        
        alert('Sample products added successfully!');
        if (document.getElementById('productsList')) {
            loadProducts();
        }
    } catch (error) {
        console.error('Error adding sample products:', error);
        alert('Error adding sample products');
    }
}