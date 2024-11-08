import fetch from 'node-fetch';

const handler = async (message, { text: prompt, command, conn }) => {
    const baseUrl = 'https://tt.papp.com/api/v1/generate?prompt=';
    let apiUrl;
    
    if (!prompt) throw new Error('⚠️ Please provide a prompt.');

    switch (command) {
        case 'hercai-animefy':
            apiUrl = `${baseUrl}animefy&prompt=${encodeURIComponent(prompt)}`;
            break;
        case 'hercai-photo':
            apiUrl = `${baseUrl}photoleap&prompt=${encodeURIComponent(prompt)}`;
            break;
        case 'hercai-real':
            apiUrl = `${baseUrl}realistic&prompt=${encodeURIComponent(prompt)}`;
            break;
        case 'hercai-cartoon':
            apiUrl = `${baseUrl}cartoon&prompt=${encodeURIComponent(prompt)}`;
            break;
        case 'hercai-ai':
            apiUrl = `${baseUrl}hercai-ai&prompt=${encodeURIComponent(prompt)}`;
            break;
        default:
            throw new Error('⚠️ Command not recognized.');
    }

    message.react('⏳');

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

        const data = await response.json();
        console.log('API Response:', data);

        let resultUrl;
        if (data.result === 'success' && data.data && data.data.result_url) {
            resultUrl = data.data.result_url;
        } else {
            throw new Error('No image found in the API response.');
        }

        await conn.sendFile(
            message.chat,
            resultUrl,
            prompt,
            '✳️ Powered by CULT API ✳️',
            message
        );

        message.react('✅');
    } catch (error) {
        console.error('❌ Error:', error);
        message.react('❌');
        throw new Error(`❌ ${error.message}`);
    }
};

handler.command = [
    'hercai-animefy',
    'hercai-photo',
    'hercai-real',
    'hercai-cartoon',
    'hercai-ai'
];

handler.help = ['AI'];
handler.tags = ['hercai', 'media', 'generator'];

export default handler;
