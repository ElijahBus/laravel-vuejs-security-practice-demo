self.addEventListener('install', function (event) {
    event.waitUntil(self.skipWaiting());
    console.log('[SW] serviceworker installed! ' + new Date().getUTCDate());
});

self.addEventListener('activate', function (event) {
    event.waitUntil(self.clients.claim());
    console.log('[SW] serviceworker ready! ' + + new Date().getUTCDate());
});

// Hardocded checks for origins/paths to send credentials to
const whitelistedOrigins = [
    "http://localhost:8000",
]

const whitelistedPathRegex = /\/api\/[^.]*$/

// Service worker global variables
let token = '';
let clientId = '';
let clientSecret = '';

// let hkToken = ''

// Ready to receive incoming event from the client
self.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'HELLO') {
        console.log("Service worker received the message: ", event.data.type)
        token = event.data.data.token;
        clientId = event.data.data.client_id;
        clientSecret = event.data.data.client_secret;
    }
})


const requestHKToken = async () => {
    const rawResponse = await fetch('http://localhost:8000/api/admin-3rd-party/login', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'client_id': '', // TODO: Pass real value here
            'client_secret': '' // TODO: Pass real value here
        },
        body: JSON.stringify({ user_identifier: '6737a47a435cebc8e43f' })
    });
    const content = await rawResponse.json();
    // hkToken = content.access_token;
}

/**
 * Addd authentication for any request origins that matches the whitelisted
 * @param {*} event
 */
const addAuthHeader = function (event) {

    let destURL = new URL(event.request.url);
    if (whitelistedOrigins.includes(destURL.origin) && whitelistedPathRegex.test(destURL.pathname)) {
        const modifiedHeaders = new Headers(event.request.headers);
        if (token) {
            modifiedHeaders.append('Authorization', token)
            modifiedHeaders.append('client_id', clientId)
            modifiedHeaders.append('client_secret', clientSecret)
            console.log("** Headers appended");
        } else {
            console.log("**Token not found or origin not in whitelisted URLs")
        }
        const authReq = new Request(event.request, { headers: modifiedHeaders, mode: 'cors' });
        event.respondWith(cleanedUpResponse(authReq));
    } else {
        console.log("** STH WRONG - DEST URL ORIGIN: ", destURL.origin);
        console.log('** DEST URL Matches regex: ' + destURL.origin + ' - ' + whitelistedPathRegex.test(destURL.pathname))
        console.log('** URL in ORIGINS: ' + destURL.origin + ' - ' + whitelistedOrigins.includes(destURL.origin))
    }
}

/**
 * Perform the request and retrun a cleaned copy of the response
 * abstracting sentive information. eg. tokens and cliend IDs in headers.
 *
 * @param {Request} authReq
 * @param {String} url
 * @returns Promise
 */
const cleanedUpResponse = async (authReq) => {
    const response = await fetch(authReq);
    const changeResponse = response.ok;
    if (!changeResponse) {
        return response; // Considering a failure
    }
    const data = await response.json();
    const { ...body } = data;

    const headersToReturn = new Headers(response.headers);
    headersToReturn.append('done-by', 'elijahbus');

    // Retrieve token and send the response without it
    return new Response(JSON.stringify(body), {
        headers: headersToReturn,
        status: response.status,
        statusText: response.statusText,
    });
};

// Intercept all fetch requests and add the auth header
self.addEventListener('fetch', addAuthHeader);
