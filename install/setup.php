<?php
// Setup script to create necessary directories and set permissions
$directories = [
    '../uploads',
    '../logs'
];

foreach ($directories as $dir) {
    if (!file_exists($dir)) {
        mkdir($dir, 0755, true);
    }
}

// Create .env file if it doesn't exist
if (!file_exists('../.env')) {
    copy('../.env.example', '../.env');
    chmod('../.env', 0644);
}

// Create installed.txt when installation is complete
function markInstallationComplete() {
    file_put_contents('installed.txt', date('Y-m-d H:i:s'));
    chmod('installed.txt', 0644);
}