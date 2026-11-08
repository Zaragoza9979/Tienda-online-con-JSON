// Variables globales para el estado de la aplicación
let allProducts = [];
let cart = [];
let userData = {};

// Cargar los datos iniciales al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadUserData();
});

// Función para cargar los productos desde products.json
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        allProducts = await response.json();
        renderCategories();
        renderProducts(allProducts);
    } catch (error) {
        console.error('Error al cargar los productos:', error);
        document.getElementById('product-grid').innerHTML = '<p class="text-red-500 col-span-full text-center">Error al cargar el catálogo de películas.</p>';
    }
}

// Función para cargar los datos del usuario (userData.json)
async function loadUserData() {
    try {
        const response = await fetch('userData.json');
        userData = await response.json();
        const deliveryInfo = document.getElementById('user-delivery-info');
        if (deliveryInfo) {
            deliveryInfo.innerHTML = `Envío para <b>${userData.name}</b> a: <i>${userData.address}</i>`;
        }
    } catch (error) {
        console.error('Error al cargar los datos del usuario:', error);
        const deliveryInfo = document.getElementById('user-delivery-info');
        if (deliveryInfo) {
            deliveryInfo.innerText = 'No se pudieron cargar los datos de envío.';
        }
    }
}

// Generar dinámicamente los botones de categorías en base al catálogo
function renderCategories() {
    const categoriesContainer = document.getElementById('category-filters');
    // Extraer categorías únicas
    const categories = ['todos', ...new Set(allProducts.map(p => p.category))];

    // Limpiar manteniendo el botón "Todo"
    categoriesContainer.innerHTML = `
        <button onclick="filtercategory('todos')" class="filter-btn active px-5 py-2.5 rounded-xl font-medium text-sm transition bg-red-600 text-white shadow-md">
            Todo
        </button>
    `;

    categories.forEach(category => {
        if (category !== 'todos') {
            const btn = document.createElement('button');
            btn.className = 'filter-btn px-5 py-2.5 rounded-xl font-medium text-sm transition bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 shadow-md';
            btn.innerText = category;
            btn.onclick = () => filtercategory(category);
            categoriesContainer.appendChild(btn);
        }
    });
}

// Filtrar productos por categoría
function filtercategory(category) {
    // Actualizar clases activas de los botones
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.innerText.toLowerCase() === category.toLowerCase() || (category === 'todos' && btn.innerText === 'Todo')) {
            btn.className = 'filter-btn active px-5 py-2.5 rounded-xl font-medium text-sm transition bg-red-600 text-white shadow-md';
        } else {
            btn.className = 'filter-btn px-5 py-2.5 rounded-xl font-medium text-sm transition bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 shadow-md';
        }
    });

    if (category === 'todos') {
        renderProducts(allProducts);
    } else {
        const filtered = allProducts.filter(p => p.category.toLowerCase() === category.toLowerCase());
        renderProducts(filtered);
    }
}

// Renderizar las tarjetas de productos en el grid
function renderProducts(productos) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';

    const disponibles = productos.filter(p => p.stock > 0);

    if (disponibles.length === 0) {
        grid.innerHTML = '<p class="text-slate-400 col-span-full text-center py-10">No hay productos disponibles en esta categoría.</p>';
        return;
    }
    // Dentro de tu función renderProducts(productos)
    disponibles.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-xl hover:border-slate-700 transition';
        card.innerHTML = `
        <!-- Imagen del producto -->
        <div class="h-48 overflow-hidden bg-slate-950 flex items-center justify-center">
            <img src="${producto.image}" alt="${producto.name}" class="w-full h-full object-cover object-center hover:scale-105 transition duration-300">
        </div>

        <div class="p-6 flex-1 flex flex-col justify-between">
            <div>
                <span class="text-xs font-semibold text-red-400 uppercase tracking-wider">${producto.category}</span>
                <h3 class="text-lg font-bold text-white mt-1 mb-2">${producto.name}</h3>
                <p class="text-slate-400 text-sm mb-4 line-clamp-2">${producto.description}</p>
            </div>
            <div>
                <div class="flex justify-between items-center mb-4">
                    <span class="text-2xl font-black text-white">${producto.price.toFixed(2)} €</span>
                    <span class="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">Stock: ${producto.stock}</span>
                </div>
                <button onclick="addToCart('${producto.id}')" class="w-full bg-slate-800 hover:bg-red-600 text-white py-2.5 rounded-xl font-medium transition flex items-center justify-center gap-2">
                    <span>Añadir a la cesta</span>
                </button>
            </div>
        </div>
    `;
        grid.appendChild(card);
    });

    disponibles.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-xl hover:border-slate-700 transition';
        card.innerHTML = `
            <div class="p-6 flex-1 flex flex-col justify-between">
                <div>
                    <span class="text-xs font-semibold text-red-400 uppercase tracking-wider">${producto.category}</span>
                    <h3 class="text-lg font-bold text-white mt-1 mb-2">${producto.name}</h3>
                    <p class="text-slate-400 text-sm mb-4 line-clamp-2">${producto.description}</p>
                </div>
                <div>
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-2xl font-black text-white">${producto.price.toFixed(2)} €</span>
                        <span class="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">Stock: ${producto.stock}</span>
                    </div>
                    <button onclick="addToCart('${producto.id}')" class="w-full bg-slate-800 hover:bg-red-600 text-white py-2.5 rounded-xl font-medium transition flex items-center justify-center gap-2">
                        <span>Añadir a la cesta</span>
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Añadir productos a la cesta
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
        } else {
            alert('No hay más stock disponible para este artículo.');
            return;
        }
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCartUI();
}

// Actualizar la interfaz visual de la cesta (contador y productos en el modal)
function updateCartUI() {
    const counter = document.getElementById('cart-counter');
    const container = document.getElementById('cart-items-container');
    const totalElement = document.getElementById('cart-total');

    // Calcular total de piezas
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    counter.innerText = totalItems;

    if (cart.length === 0) {
        container.innerHTML = '<p class="text-slate-500 text-center py-8">Tu cesta está vacía.</p>';
        totalElement.innerText = '0.00 €';
        return;
    }

    container.innerHTML = '';
    let totalPrice = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalPrice += itemTotal;

        const row = document.createElement('div');
        row.className = 'flex justify-between items-center py-3';
        row.innerHTML = `
            <div class="flex-1 pr-4">
                <h4 class="font-bold text-white text-sm">${item.name}</h4>
                <p class="text-xs text-slate-400">${item.price.toFixed(2)} € x ${item.quantity}</p>
            </div>
            <div class="flex items-center gap-3">
                <span class="font-bold text-red-400">${itemTotal.toFixed(2)} €</span>
                <div class="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
                    <button onclick="changeQuantity('${item.id}', -1)" class="px-2 text-slate-300 hover:text-white">-</button>
                    <span class="text-xs px-1">${item.quantity}</span>
                    <button onclick="changeQuantity('${item.id}', 1)" class="px-2 text-slate-300 hover:text-white">+</button>
                </div>
            </div>
        `;
        container.appendChild(row);
    });

    totalElement.innerText = `${totalPrice.toFixed(2)} €`;
}

// Cambiar cantidad dentro del carrito
function changeQuantity(productId, delta) {
    const item = cart.find(i => i.id === productId);
    const product = allProducts.find(p => p.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== productId);
    } else if (item.quantity > product.stock) {
        item.quantity = product.stock;
        alert('Has alcanzado el límite de stock disponible.');
    }

    updateCartUI();
}

// Abrir o cerrar el modal del carrito
function toggleCartModal() {
    const modal = document.getElementById('cart-modal');
    modal.classList.toggle('hidden');
}

// Función simulada para ver JSONs (puedes adaptarla si creas un modal para ello)
function toggleJsonModal() {
    alert('Puedes consultar los archivos "products.json" y "userData.json" directamente en tu estructura de proyecto.');
}

// Finalizar compra
function checkout() {
    if (cart.length === 0) {
        alert('La cesta está vacía.');
        return;
    }
    alert(`¡Compra realizada con éxito!\n\nEnviando a: ${userData.name}\nDirección: ${userData.address}`);
    cart = [];
    updateCartUI();
    toggleCartModal();
}