// Function to fetch products for shopping and render them
async function fetchAndRenderShopping() {
    try {
        const response = await fetch(`https://product-service-2ki2.onrender.com/products`);
        const data = await response.json();
        const products = data.products;

        let productsContainerId = 'shopping-products-container';
        const productsContainer = document.getElementById(productsContainerId);
        productsContainer.innerHTML = '';

        if (products && products.length > 0) {
            products.forEach(product => {
                const productCard = `
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-lg font-semibold mb-2">${product.name}</h3>
            <p class="text-gray-600">$${product.price}</p>
            <p>Quantity: ${product.quantity}</p>
            <button onclick="addToCart(${product.id})" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Add to Cart</button>
          </div>
        `;
                productsContainer.innerHTML += productCard;
            });
        }
        else {
            productsContainer.innerHTML += "<div>There are no products to display</div>";
        }
    } catch (error) {
        console.error('Error fetching cart items:', error);
    }
}

// Function to add a product to the cart
async function addToCart(productId) {
    try {
        const response = await fetch(`https://cart-service-ei2j.onrender.com/cart/1/add/${productId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ quantity: 1 })
        });
        const data = await response.json();
        alert(data.message);
        fetchAndRenderShopping()
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}

// Function to fetch products from stock and render them
async function fetchAndRenderStore() {
    try {
        const response = await fetch(`https://product-service-2ki2.onrender.com/products`);
        const data = await response.json();
        const products = data.products;

        let storeContainerId = 'store-products-container';

        const storeContainer = document.getElementById(storeContainerId);
        storeContainer.innerHTML = '';

        if (products && products.length > 0) {
            products.forEach(product => {
                const productItem = document.createElement('div');
                productItem.classList.add('bg-white', 'p-4', 'rounded-lg', 'shadow-md', 'mb-4');
                productItem.innerHTML = `
                    <p class="text-lg font-semibold">${product.name}</p>
                    <p class="text-gray-600">Quantity: ${product.quantity}</p>
                    <p class="text-gray-600">Price: $${product.price}</p>
                    <p class="text-gray-600">ID: ${product.id}</p>
                `;
                storeContainer.appendChild(productItem);
            });
        }
        else {
            storeContainer.innerHTML += "<div>There are no products to display</div>";
        }
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

// Function to add a product to the store
async function addProduct() {
    const productID = parseInt(document.getElementById('productID').value);
    const productName = document.getElementById('productName').value;
    const productPrice = parseFloat(document.getElementById('productPrice').value);
    const productQuantity = parseInt(document.getElementById('productQuantity').value);

    try {
        const response = await fetch('https://product-service-2ki2.onrender.com/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: productID,
                name: productName,
                price: parseFloat(productPrice),
                quantity: parseInt(productQuantity)
            })
        });
        if (response.status === 409) {
            alert('Product with this ID already exists');
        } else if (response.status === 400) {
            const data = await response.json();
            alert(data.error)
        } else {
            const data = await response.json();
            alert(data.message);
            fetchAndRenderStore();
        }
    } catch (error) {
        console.error('Error adding product:', error);
    }
}

// Function to fetch and render cart items
async function fetchAndRenderCart() {
    try {
        const response = await fetch('https://cart-service-ei2j.onrender.com/cart/1');
        const data = await response.json();

        const cartItemsContainer = document.getElementById('cart-items-container');
        cartItemsContainer.innerHTML = '';

        if ((Object.keys(data.items).length > 0)) {
            const cartItems = Object.values(data.items);
            cartItems.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.classList.add('bg-white', 'p-4', 'rounded-lg', 'shadow-md', 'mb-4');
                cartItem.innerHTML = `
                    <p class="text-lg font-semibold">${item.name}</p>
                    <p class="text-gray-600">Quantity: ${item.quantity}</p>
                    <p class="text-gray-600">Price: $${item.price}</p>
                `;
                cartItemsContainer.appendChild(cartItem);
            });
            const checkoutButton = document.createElement('button');
            checkoutButton.innerHTML = 'Checkout';
            checkoutButton.classList.add('mt-4', 'bg-blue-500', 'text-white', 'px-4', 'py-2', 'rounded', 'hover:bg-blue-600');
            checkoutButton.addEventListener('click', () => {
                window.location.href = 'views/checkout.html';
            });
            cartItemsContainer.appendChild(checkoutButton);
        }
        else {
            const emptyCartText = document.createElement('div');
            emptyCartText.classList.add('empty-cart-text');
            emptyCartText.innerHTML = `
            <div>Cart is empty</div>
            `;
            cartItemsContainer.appendChild(emptyCartText);
        }
    } catch (error) {
        console.error('Error fetching cart items:', error);
    }
}

// Switch between views (Shopping, Store, Cart)
function switchView(view) {
    const views = ['shopping-view', 'store-view', 'cart-view'];
    views.forEach(v => {
        const element = document.getElementById(v);
        if (element) {
            if (v === view) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        }
    });

    if (view === 'shopping-view') {
        fetchAndRenderShopping();
    }
    else if (view == 'store-view') {
        fetchAndRenderStore()
    }
    else if (view === 'cart-view') {
        fetchAndRenderCart();
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    const loadingMessage = document.createElement('div');
    loadingMessage.id = 'loading-message';
    loadingMessage.innerText = "One sec while we wake up our servers";
    loadingMessage.classList.add('text-center', 'text-gray-600', 'mt-4');
    document.body.appendChild(loadingMessage);

    let loadingTimeout = setTimeout(() => {
        document.getElementById('loading-message').style.display = 'block';
    }, 2000);

    try {
        await fetchAndRenderStore();

        clearTimeout(loadingTimeout);
        document.getElementById('loading-message').style.display = 'none';
        console.log("Store data fetched and rendered successfully");
    } catch (error) {
        // Handle error if fetching data fails
        clearTimeout(loadingTimeout);
        document.getElementById('loading-message').innerText = "Failed to fetch data. Please try again later.";
        console.error('Error fetching store data:', error);
    }
});