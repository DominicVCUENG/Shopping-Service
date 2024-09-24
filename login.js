// Login Function
async function login() {
    const username = document.getElementById('username').value;
    if (!username) {
        alert("Please enter your name");
        return;
    }
    
    const loadingMessage = document.createElement('div');
    loadingMessage.id = 'loading-message';
    loadingMessage.innerText = "Logging you in. One second...";
    loadingMessage.classList.add('text-center', 'text-gray-600', 'mt-4');
    document.body.appendChild(loadingMessage);

    try {
        fetch(`https://product-service-n5sp.onrender.com/products`);
        const response = await fetch(`https://login-1gyl.onrender.com/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
            credentials: 'include'
        });
        const data = await response.json();
        document.getElementById('loading-message').style.display = 'none';
        if (data.username) {
            localStorage.setItem('username', data.username);
            fetch(`https://cart-service-ei2j.onrender.com/cart/${data.username}`);
            showMainContent();
        }
    } catch (error) {
        console.error('Error logging in:', error);
    }
}

function showMainContent() {
    window.location.href = "home.html";
}
