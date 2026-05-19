const { execSync } = require('child_process');
const { writeFileSync, existsSync } = require('fs');

const version = require('./package.json').version;

let sha1 = 'dev';
try {
	sha1 = execSync('git rev-parse --short HEAD', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
} catch (e) {
	console.warn('⚠️ Git non disponible, utilisation de SHA1 par défaut: "dev"');
}

const content = `// Auto-generated - Ne pas modifier manuellement
export const VERSION = '${version}';
export const SHA1 = '${sha1}';
`;

// Créer le dossier environments s'il n'existe pas
const envDir = './environments';
if (!existsSync(envDir)) {
	require('fs').mkdirSync(envDir, { recursive: true });
}

writeFileSync('./environments/version.ts', content, { encoding: 'utf8' });
console.log(`✅ Version ${version} - SHA1 ${sha1}`);
