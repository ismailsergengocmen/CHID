export const checkCookie = (cookieName) => {
	var cookies = document.cookie.split(';'); // Split cookies by semicolon
	console.log('cookies: ', cookies);
	// Loop through all cookies
	for (var i = 0; i < cookies.length; i++) {
		var cookie = cookies[i].trim(); // Remove whitespace

		// Check if cookie name matches the name we are looking for
		if (cookie.indexOf(cookieName) === 0) {
			return true; // Cookie exists
		}
	}

	return false; // Cookie does not exist
};

export const debounce = (func, wait) => {
	let timeout;
	return function (...args) {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			func.apply(this, args);
		}, wait);
	};
};
