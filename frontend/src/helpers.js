export function toggleMode(isLightMode, setIsLightMode) {
    const newMode = !isLightMode;
    setIsLightMode(newMode);
    localStorage.setItem('isLightMode', JSON.stringify(newMode));
    document.body.style.backgroundColor = newMode ? '#fff' : '#000';
    document.body.style.color = newMode ? '#000' : '#fff';
}

export function openMenu(isLightMode) {
    document.querySelector('.menu').style.animation = 'slideIn 0.5s forwards';
    const listItems = document.querySelectorAll('.menu ul li');
    listItems.forEach((item, index) => {
        item.style.animation = `fadeIn 0.5s forwards ${index / 7 + 0.3}s`;
    });
}

export function closeMenu() {
    document.querySelector('.menu').style.animation = 'slideOut 0.5s forwards';
    const listItems = document.querySelectorAll('.menu ul li');
    setTimeout(() => {
        listItems.forEach((item) => {
            item.style.animation = '';
        });
    }, 500);
}
