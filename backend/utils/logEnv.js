function logEnv(port, frontend_origin, node_env, is_production) {
    console.log('🌍 Environment Configuration:');
    console.log('   PORT:', port);
    console.log('   FRONTEND_ORIGIN:', frontend_origin);
    console.log('   NODE_ENV:', node_env);
    console.log('   isProduction:', is_production);
}

export default logEnv;