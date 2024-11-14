<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

$step = $_GET['step'] ?? 1;
$error = '';
$success = '';

// Installation steps
function checkRequirements() {
    $requirements = [
        'php' => ['required' => '8.0.0', 'current' => PHP_VERSION],
        'extensions' => [
            'pdo',
            'pdo_mysql',
            'json',
            'openssl'
        ],
        'writable_paths' => [
            '../.env',
            '../uploads',
            '../logs'
        ]
    ];
    
    $errors = [];
    
    // Check PHP version
    if (version_compare(PHP_VERSION, $requirements['php']['required'], '<')) {
        $errors[] = "PHP version must be at least {$requirements['php']['required']}. Current version: " . PHP_VERSION;
    }
    
    // Check extensions
    foreach ($requirements['extensions'] as $ext) {
        if (!extension_loaded($ext)) {
            $errors[] = "Required PHP extension missing: {$ext}";
        }
    }
    
    // Check writable paths
    foreach ($requirements['writable_paths'] as $path) {
        if (!is_writable($path)) {
            $errors[] = "Path not writable: {$path}";
        }
    }
    
    return $errors;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    switch($step) {
        case 2:
            // Database configuration
            $dbHost = $_POST['db_host'] ?? '';
            $dbName = $_POST['db_name'] ?? '';
            $dbUser = $_POST['db_user'] ?? '';
            $dbPass = $_POST['db_pass'] ?? '';
            
            try {
                $dsn = "mysql:host=$dbHost;dbname=$dbName";
                $pdo = new PDO($dsn, $dbUser, $dbPass);
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                
                // Save database config
                $envContent = "DB_HOST=$dbHost\n";
                $envContent .= "DB_NAME=$dbName\n";
                $envContent .= "DB_USER=$dbUser\n";
                $envContent .= "DB_PASS=$dbPass\n";
                $envContent .= "JWT_SECRET=" . bin2hex(random_bytes(32)) . "\n";
                
                file_put_contents('../.env', $envContent);
                
                $_SESSION['db_configured'] = true;
                header('Location: index.php?step=3');
                exit;
            } catch (PDOException $e) {
                $error = "Database connection failed: " . $e->getMessage();
            }
            break;
            
        case 3:
            // Admin account setup
            $adminName = $_POST['admin_name'] ?? '';
            $adminEmail = $_POST['admin_email'] ?? '';
            $adminPass = $_POST['admin_password'] ?? '';
            
            if (strlen($adminPass) < 8) {
                $error = "Password must be at least 8 characters long";
                break;
            }
            
            try {
                // Create admin user
                $hashedPassword = password_hash($adminPass, PASSWORD_DEFAULT);
                
                // Load database config
                $envVars = parse_ini_file('../.env');
                $pdo = new PDO(
                    "mysql:host={$envVars['DB_HOST']};dbname={$envVars['DB_NAME']}",
                    $envVars['DB_USER'],
                    $envVars['DB_PASS']
                );
                
                $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin')");
                $stmt->execute([$adminName, $adminEmail, $hashedPassword]);
                
                $_SESSION['installation_complete'] = true;
                header('Location: index.php?step=4');
                exit;
            } catch (Exception $e) {
                $error = "Failed to create admin account: " . $e->getMessage();
            }
            break;
    }
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ShiftMaster Installation</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="max-w-2xl mx-auto py-12 px-4">
        <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-900">ShiftMaster Installation</h1>
            <div class="mt-4 flex justify-center space-x-4">
                <?php for($i = 1; $i <= 4; $i++): ?>
                    <div class="flex items-center">
                        <div class="<?= $i <= $step ? 'bg-blue-600' : 'bg-gray-200' ?> rounded-full h-8 w-8 flex items-center justify-center text-white font-medium">
                            <?= $i ?>
                        </div>
                        <?php if($i < 4): ?>
                            <div class="h-1 w-12 <?= $i < $step ? 'bg-blue-600' : 'bg-gray-200' ?> mx-2"></div>
                        <?php endif; ?>
                    </div>
                <?php endfor; ?>
            </div>
        </div>

        <?php if($error): ?>
            <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm text-red-700"><?= htmlspecialchars($error) ?></p>
                    </div>
                </div>
            </div>
        <?php endif; ?>

        <div class="bg-white shadow rounded-lg">
            <?php if($step == 1): ?>
                <div class="p-6">
                    <h2 class="text-lg font-medium mb-4">System Requirements Check</h2>
                    <?php
                    $errors = checkRequirements();
                    if(empty($errors)):
                    ?>
                        <div class="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                            <p class="text-green-700">All requirements are met!</p>
                        </div>
                        <div class="mt-6">
                            <a href="?step=2" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Continue to Database Setup
                            </a>
                        </div>
                    <?php else: ?>
                        <div class="space-y-2">
                            <?php foreach($errors as $error): ?>
                                <div class="bg-red-50 border-l-4 border-red-400 p-4">
                                    <p class="text-red-700"><?= htmlspecialchars($error) ?></p>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </div>
            <?php elseif($step == 2): ?>
                <div class="p-6">
                    <h2 class="text-lg font-medium mb-4">Database Configuration</h2>
                    <form method="POST" class="space-y-4">
                        <div>
                            <label for="db_host" class="block text-sm font-medium text-gray-700">Database Host</label>
                            <input type="text" name="db_host" id="db_host" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" value="localhost">
                        </div>
                        <div>
                            <label for="db_name" class="block text-sm font-medium text-gray-700">Database Name</label>
                            <input type="text" name="db_name" id="db_name" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                        </div>
                        <div>
                            <label for="db_user" class="block text-sm font-medium text-gray-700">Database User</label>
                            <input type="text" name="db_user" id="db_user" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                        </div>
                        <div>
                            <label for="db_pass" class="block text-sm font-medium text-gray-700">Database Password</label>
                            <input type="password" name="db_pass" id="db_pass" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                        </div>
                        <div class="mt-6">
                            <button type="submit" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Test Connection and Continue
                            </button>
                        </div>
                    </form>
                </div>
            <?php elseif($step == 3): ?>
                <div class="p-6">
                    <h2 class="text-lg font-medium mb-4">Admin Account Setup</h2>
                    <form method="POST" class="space-y-4">
                        <div>
                            <label for="admin_name" class="block text-sm font-medium text-gray-700">Admin Name</label>
                            <input type="text" name="admin_name" id="admin_name" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                        </div>
                        <div>
                            <label for="admin_email" class="block text-sm font-medium text-gray-700">Admin Email</label>
                            <input type="email" name="admin_email" id="admin_email" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                        </div>
                        <div>
                            <label for="admin_password" class="block text-sm font-medium text-gray-700">Admin Password</label>
                            <input type="password" name="admin_password" id="admin_password" required minlength="8" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                        </div>
                        <div class="mt-6">
                            <button type="submit" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Create Admin Account and Complete Installation
                            </button>
                        </div>
                    </form>
                </div>
            <?php elseif($step == 4): ?>
                <div class="p-6">
                    <div class="text-center">
                        <svg class="mx-auto h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        <h2 class="mt-4 text-lg font-medium text-gray-900">Installation Complete!</h2>
                        <p class="mt-2 text-sm text-gray-500">
                            ShiftMaster has been successfully installed. You can now log in to your admin account.
                        </p>
                        <div class="mt-6">
                            <a href="../" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Go to Login Page
                            </a>
                        </div>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>