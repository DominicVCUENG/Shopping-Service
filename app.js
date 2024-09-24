// Function to fetch products for shopping and render them
async function fetchAndRenderShopping() {
    try {
        const response = await fetch(`https://product-service-n5sp.onrender.com/products`);
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
    const username = localStorage.getItem('username');
    try {
        const response = await fetch(`https://cart-service-ei2j.onrender.com/cart/${username}/add/${productId}`, {
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

    const cartButton = document.getElementById('cart-button');

    try {
        const response = await fetch(`https://cart-service-ei2j.onrender.com/cart/${username}`);
        const data = await response.json();

        if (data.items) {
            const itemCount = Object.keys(data.items).length;
            if (itemCount > 0) {
                cartButton.innerText = `Cart(${itemCount})`;
            } else {
                cartButton.innerText = 'Cart';
            }
        } else {
            console.log("Did not see any items")
        }
    } catch (error) {
        console.error('Error fetching cart items:', error);
    }
}

// Function to fetch products from stock and render them
async function fetchAndRenderStore() {
    try {
        const response = await fetch(`https://product-service-n5sp.onrender.com/products`);
        const data = await response.json();
        const products = data.products;

        let storeContainerId = 'store-products-container';

        const storeContainer = document.getElementById(storeContainerId);
        storeContainer.innerHTML = '';

        if (products && products.length > 0) {
            products.forEach(product => {
                const productItem = document.createElement('div');
                productItem.classList.add('bg-white', 'p-4', 'rounded-lg', 'shadow-md', 'mb-4', 'store-items');
                productItem.innerHTML = `
                    <div>
                        <p class="text-lg font-semibold">${product.name}</p>
                        <p class="text-gray-600">Quantity: ${product.quantity}</p>
                        <p class="text-gray-600">Price: $${product.price}</p>
                        <p class="text-gray-600">ID: ${product.id}</p>
                    </div>
                    <div class="quantity-elements">
                        <input id="quantity-${product.id}" type="number" class="quantity-input shadow-md" value="1" min="1"></input>
                        <button id="quantity-button-${product.id}" class="quantity-button" onclick="updateQuantity(${product.id})">Update Quantity</button>
                    </div>
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

async function updateQuantity(productId) {
    const quantityInput = document.getElementById(`quantity-${productId}`).value;

    const response = await fetch(`https://product-service-n5sp.onrender.com/products/${productId}`);
    const data = await response.json();
    const quantity = data.product['quantity'];

    if (quantityInput > quantity) {
        try {
            const difference = quantityInput - quantity
            const response = await fetch(`https://product-service-n5sp.onrender.com/products/${productId}/add_quantity`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quantity: difference })
            });

            if (response.ok) {
                alert('Item quantity has been updated')
                fetchAndRenderStore()
            }
        } catch (error) {
            console.log(error)
        }
    }
    else if (quantityInput < quantity) {
        try {
            const difference = quantity - quantityInput
            const response = await fetch(`https://product-service-n5sp.onrender.com/products/${productId}/remove_quantity`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quantity: difference })
            });

            if (response.ok) {
                alert('Item quantity has been updated')
                fetchAndRenderStore()
            }
        } catch (error) {
            console.log(error)
        }
    }
}

// Function to add a product to the store
async function addProduct() {
    const productID = parseInt(document.getElementById('productID').value);
    const productName = document.getElementById('productName').value;
    const productPrice = parseFloat(document.getElementById('productPrice').value);
    const productQuantity = parseInt(document.getElementById('productQuantity').value);

    try {
        const response = await fetch('https://product-service-n5sp.onrender.com/products', {
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
    const username = localStorage.getItem('username');
    try {
        let loadingTimeout = setTimeout(() => {
            document.getElementById('loading-message').style.display = 'block';
            document.getElementById('content').style.display = 'none';
        }, 1000);

        const response = await fetch(`https://cart-service-ei2j.onrender.com/cart/${username}`);
        const data = await response.json();

        clearTimeout(loadingTimeout);
        document.getElementById('loading-message').style.display = 'none';
        document.getElementById('content').style.display = 'block';

        const cartItemsContainer = document.getElementById('cart-items-container');
        cartItemsContainer.innerHTML = '';

        if (Object.keys(data.items).length > 0) {
            const cartItems = Object.entries(data.items);
            cartItems.forEach(([id, item]) => {
                const cartItem = document.createElement('div');
                cartItem.classList.add('bg-white', 'p-4', 'rounded-lg', 'shadow-md', 'mb-4');
                cartItem.innerHTML = `
                    <div>
                        <p class="text-lg font-semibold">${item.name}</p>
                        <p class="text-gray-600">Quantity: ${item.quantity}</p>
                        <p class="text-gray-600">Price: $${item.price}</p>
                        <button class="remove-button" onclick="removeItem(${id}, '${username}', ${item.quantity})">Remove</button>
                    </div>
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

async function removeItem(itemId, username, itemQuantity) {
    try {
        const response = await fetch(`https://cart-service-ei2j.onrender.com/cart/${username}/remove/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ quantity: itemQuantity })
        });
        if (response.ok) {
            const cartButton = document.getElementById('cart-button');

            try {
                const response = await fetch(`https://cart-service-ei2j.onrender.com/cart/${username}`);
                const data = await response.json();

                if (data.items) {
                    const itemCount = Object.keys(data.items).length;
                    if (itemCount > 0) {
                        cartButton.innerText = `Cart(${itemCount})`;
                    } else {
                        cartButton.innerText = 'Cart';
                    }
                } else {
                    console.log("Did not see any items")
                }
            } catch (error) {
                console.error('Error fetching cart items:', error);
            }
        }
        
        const data = await response.json();
        alert(data.message);
        fetchAndRenderCart();
    } catch (error) {
        console.log(error);
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
    await checkSession();

    const username = localStorage.getItem('username');
    const loadingMessage = document.createElement('div');
    loadingMessage.id = 'loading-message';
    loadingMessage.innerText = "One sec while we wake up our servers...";
    loadingMessage.classList.add('text-center', 'text-gray-600', 'mt-4');
    document.body.appendChild(loadingMessage);

    let loadingTimeout = setTimeout(() => {
        document.getElementById('content').style.display = 'none';
        document.getElementById('loading-message').style.display = 'block';
    }, 1000);

    try {
        await fetchAndRenderStore();

        clearTimeout(loadingTimeout);
        document.getElementById('loading-message').style.display = 'none';
        document.getElementById('content').style.display = 'block';
    } catch (error) {
        // Handle error if fetching data fails
        clearTimeout(loadingTimeout);
        document.getElementById('loading-message').innerText = "Failed to fetch data. Please try again later.";
        console.error('Error fetching store data:', error);
    }

    const cartButton = document.getElementById('cart-button');

    try {
        const response = await fetch(`https://cart-service-ei2j.onrender.com/cart/${username}`);
        const data = await response.json();

        if (data.items) {
            const itemCount = Object.keys(data.items).length;
            if (itemCount > 0) {
                cartButton.innerText = `Cart(${itemCount})`;
            } else {
                cartButton.innerText = 'Cart';
            }
        } else {
            console.log("Cart empty")
        }
    } catch (error) {
        console.error('Error fetching cart items:', error);
    }

});

async function logout() {
    try {
        const response = await fetch(`https://login-1gyl.onrender.com/logout`, {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            await response.json();
            localStorage.removeItem('username');
            location.reload();
        } else {
            console.error('Error logging out: ', response.statusText);
        }
    } catch (error) {
        console.error('Error logging out:', error);
    }
}

async function checkSession() {
    try {
        const response = await fetch('https://login-1gyl.onrender.com/check_session', {
            method: 'GET',
            credentials: 'include'
        });
        const data = await response.json();

        if (data.logged_in) {
            localStorage.setItem('username', data.username);
            const username = localStorage.getItem('username');
            document.getElementById("name-title").innerText = username || "DominicVCUENG";

            const logoutButton = '<button id="logout-button" onclick="logout()" class="text-center text-gray-600">Logout</button>';
            const headerItems = document.getElementById('header-items')
            headerItems.innerHTML += logoutButton;

        } else {
            window.location.href = "index.html";
        }
    } catch (error) {
        console.error('Error checking session:', error);
    }
}