exports.handler = async (event, context) => {
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            status: 'operational',
            monica_authority: 0.99999,
            timestamp: new Date().toISOString()
        })
    };
};
