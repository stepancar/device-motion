import os from 'node:os';
import http from 'node:http';

const homepage = process.argv[2];
if (!homepage) {
    console.error('Передай путь к host-ui, пример: http://localhost:9090');
    process.exit(0)
}

const server = http.createServer((req, res) => {
    
    if (req.url === '/config.json') {

        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        console.log(ipAddress);
        let responseObject;

        if (homepage.includes('localhost') && ipAddress !== '::1') {
            const {port} = new URL(homepage);
            responseObject = getConfig(`http://${ipAddress}:${port}`);
            
        } else {
            responseObject = getConfig(homepage);
        }
        
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(responseObject));
    } else {
        res.statusCode = 404;
        res.end('404 Not Found');
    }
});

const port = 4444;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);

    const networkInterfaces = os.networkInterfaces();

    const ipV4 = Object.values(networkInterfaces).flat().filter((info) => info.family === 'IPv4');

    console.log('Вставьте в адресную строку сафари одну из ссылок:');
    for (let {address} of ipV4) {
        if (address === '127.0.0.1') {
            address = 'localhost';
            console.log('Если вы хотите открыть капсулу в эмуляторе, то')
        } else {
            console.log('Если вы хотите открыть капсулу на реальном устройстве - подключите его и компьютер, где запущен этот скрипт, к одной wifi сети, тогда')
            
        }
        console.log('ссылка:', getCapsuleLink(address, port))
    }

    console.log('Некоторые wifi сети не дают общаться участникам друг с другом');
});


function getCapsuleLink(address, port) {
    const encodedPath = encodeURIComponent(`http://${address}:${port}/config.json`);
    return `akey://config_address?app_config=${encodedPath}`;
}

function getConfig(homepage) {
    const {hostname} = new URL(homepage);
    console.log(hostname)
    return {
        "config": {
            "version": 1,
            "homepage": `${homepage}`,
            "display_name": "AO",
            "webview_white_list": [
                "alfabank.ru",
                "*.alfabank.ru",
                "akey.mytrk.link",
                "trk.mail.ru",
                "ru.id.group-ib.com",
                hostname
            ],
            "created_at": 1680782133
        },
        "config_signature": "DEADBEEF"
    };
}
