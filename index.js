let loginBtn = document.getElementById('login');

loginBtn.addEventListener("click", () => {
    window.location.href = process.env.NODE_ENV !== 'production' ? 
                            'http://localhost:5500/login' :
                            'https://pasq04.github.io/OwnMusic/login';
})
