const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const XML_PATH = path.join(__dirname, 'users.xml');

// Helper to hash password with salt using SHA-256 + pbkdf2
function hashPassword(password, salt) {
    if (!salt) {
        salt = crypto.randomBytes(16).toString('hex');
    }
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
    return { hash, salt };
}

// Simple safe XML reader/parser for user objects
function getUsers() {
    if (!fs.existsSync(XML_PATH)) {
        return [];
    }
    const xml = fs.readFileSync(XML_PATH, 'utf8');
    const userBlocks = xml.match(/<user>([\s\S]*?)<\/user>/g) || [];
    
    return userBlocks.map(block => {
        const username = (block.match(/<username>(.*?)<\/username>/) || [])[1] || '';
        const password_hash = (block.match(/<password_hash>(.*?)<\/password_hash>/) || [])[1] || '';
        const salt = (block.match(/<salt>(.*?)<\/salt>/) || [])[1] || '';
        const attending = (block.match(/<attending>(.*?)<\/attending>/) || [])[1] === 'true';
        const registered_at = (block.match(/<registered_at>(.*?)<\/registered_at>/) || [])[1] || '';
        return { username, password_hash, salt, attending, registered_at };
    });
}

// Helper to serialize users back to clean XML format
function saveUsers(users) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<users>\n`;
    users.forEach(u => {
        xml += `  <user>\n`;
        xml += `    <username>${escapeXml(u.username)}</username>\n`;
        xml += `    <password_hash>${escapeXml(u.password_hash)}</password_hash>\n`;
        xml += `    <salt>${escapeXml(u.salt)}</salt>\n`;
        xml += `    <attending>${u.attending ? 'true' : 'false'}</attending>\n`;
        xml += `    <registered_at>${escapeXml(u.registered_at)}</registered_at>\n`;
        xml += `  </user>\n`;
    });
    xml += `</users>\n`;
    fs.writeFileSync(XML_PATH, xml, 'utf8');
}

function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, c => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
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
    authenticateUser
};
