const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const XLSX = require('xlsx');

const XLSX_PATH = path.join(__dirname, 'users.xlsx');
const SHEET_NAME = 'Users';

// Password hashing helper using SHA-256 + PBKDF2
function hashPassword(password, salt) {
    if (!salt) {
        salt = crypto.randomBytes(16).toString('hex');
    }
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
    return { hash, salt };
}

// Read users array from Excel (.xlsx) file
function getUsers() {
    if (!fs.existsSync(XLSX_PATH)) {
        // Initialize starter Excel file if missing
        const initialUsers = [
            {
                username: 'Underground_Raver',
                password_hash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
                salt: '7f8a9b0c1d2e3f4a',
                attending: true,
                registered_at: '2026-07-24T23:40:00Z'
            },
            {
                username: 'CyberRaver99',
                password_hash: '4017b851833d602dd0ce553fcbee64edbdfed50baaddde01f14cfee350118e477b47569364823bd01ea9d070e72de719659ab8a674b97d4e95a0fd21d7caabdf',
                salt: 'e9b08084b24ca708dcd121c0af5721f4',
                attending: true,
                registered_at: '2026-07-24T21:44:12.410Z'
            }
        ];
        saveUsers(initialUsers);
        return initialUsers;
    }

    try {
        const workbook = XLSX.readFile(XLSX_PATH);
        const worksheet = workbook.Sheets[SHEET_NAME] || workbook.Sheets[workbook.SheetNames[0]];
        if (!worksheet) return [];

        const rawData = XLSX.utils.sheet_to_json(worksheet);

        return rawData.map(row => ({
            username: String(row.username || row.Username || '').trim(),
            password_hash: String(row.password_hash || row.Password_Hash || ''),
            salt: String(row.salt || row.Salt || ''),
            attending: row.attending === true || row.attending === 'true' || row.Attending === true || row.Attending === 'true',
            registered_at: String(row.registered_at || row.Registered_At || '')
        }));
    } catch (err) {
        console.error('Error reading users.xlsx:', err);
        return [];
    }
}

// Write users array to Excel (.xlsx) file
function saveUsers(users) {
    try {
        const rows = users.map(u => ({
            username: u.username,
            password_hash: u.password_hash,
            salt: u.salt,
            attending: u.attending ? 'true' : 'false',
            registered_at: u.registered_at
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows, {
            header: ['username', 'password_hash', 'salt', 'attending', 'registered_at']
        });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, SHEET_NAME);

        XLSX.writeFile(workbook, XLSX_PATH);
    } catch (err) {
        console.error('Error writing users.xlsx:', err);
        throw err;
    }
}

function findUser(username) {
    const users = getUsers();
    return users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
}

function registerUser(username, password) {
    const existing = findUser(username);
    if (existing) {
        throw new Error('Username already exists');
    }
    const { hash, salt } = hashPassword(password);
    const newUser = {
        username: username.trim(),
        password_hash: hash,
        salt: salt,
        attending: true,
        registered_at: new Date().toISOString()
    };
    const users = getUsers();
    users.push(newUser);
    saveUsers(users);
    return { username: newUser.username, attending: newUser.attending };
}

function authenticateUser(username, password) {
    const user = findUser(username);
    if (!user) {
        return null;
    }
    const { hash } = hashPassword(password, user.salt);
    if (hash === user.password_hash) {
        return { username: user.username, attending: user.attending };
    }
    return null;
}

module.exports = {
    getUsers,
    findUser,
    registerUser,
    authenticateUser,
    XLSX_PATH
};
