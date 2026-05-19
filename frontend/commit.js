const { execSync } = require('child_process');
const { writeFileSync, existsSync, mkdirSync } = require('fs');

function getCommits() {
	try {
		const log = execSync(`git log -n 50 --pretty=format:"%h|%an|%ad|%s" --date=iso-strict`, {
			encoding: 'utf-8',
			stdio: ['pipe', 'pipe', 'pipe']
		})
			.split('\n')
			.filter(line => line.trim())
			.map(line => {
				const [hash, author, date, ...messageParts] = line.split('|');
				return { hash, author, date, message: messageParts.join('|') };
			});
		return log;
	} catch (e) {
		console.warn('⚠️ Git non disponible, commits.json vide');
		return [];
	}
}

// Créer le dossier public s'il n'existe pas
const publicDir = './public';
if (!existsSync(publicDir)) {
	mkdirSync(publicDir, { recursive: true });
}

const commits = getCommits();
writeFileSync('./public/commits.json', JSON.stringify(commits, null, 2));
console.log('✅ commits.json généré avec succès');
