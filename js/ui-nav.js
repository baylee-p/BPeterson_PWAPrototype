document.addEventListener('DOMContentLoaded', function () {
    const menus = document.querySelectorAll('.sidenav');
    M.Sidenav.init(menus, { edge: 'right' });
    console.log('Sidenav initialized.');
});
