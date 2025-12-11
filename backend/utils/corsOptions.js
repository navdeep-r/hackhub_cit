// CORS Configuration - explicit origin handling

function generateCorsOptions(url) {
    return {
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);

            if (origin.startsWith('chrome-extension://')) {
                console.log('✅ Chrome extension allowed:', origin);

                return callback(null, true);
            }

            // Check if the origin is allowed
            if (origin === url) {
                console.log('✅ Frontend allowed:', origin);

                return callback(null, true);

            }
            console.log('❌ CORS blocked origin:', origin);
            console.log('   Expected:', url);

            return callback(new Error('Not allowed by CORS'));
        },

        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        exposedHeaders: ['set-cookie']
    };
}

export default generateCorsOptions;