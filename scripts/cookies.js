const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

function createSession(user) {
    const sessionData = {
        user: {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            borrowedBooks: user.borrowedBooks,
            settings: user.settings,
            isAdmin: user.isAdmin
        },
        token: generateSessionToken(),
        expires: Date.now() + SESSION_DURATION
    };

    localStorage.setItem('session', JSON.stringify(sessionData));
    
    setCookie('sessionToken', sessionData.token, 7);


    return sessionData;
}

function checkSession() {
    const sessionStr = localStorage.getItem('session');
    const cookieToken = getCookie('sessionToken');

    if (!sessionStr || !cookieToken) {
        return false;
    }

    const session = JSON.parse(sessionStr);

    if (session.token !== cookieToken || Date.now() > session.expires) {
        clearSession();
        return false;
    }

    return session.user;
}

function clearSession() {
    localStorage.removeItem('session');
    localStorage.removeItem('currentUser');
    deleteCookie('sessionToken');
}

function generateSessionToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Strict`;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
