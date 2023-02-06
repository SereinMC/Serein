import axios from 'axios';
import fs from 'fs';
const packageNames = ['@minecraft/server', '@minecraft/server-ui', '@minecraft/server-gametest'];
const npmVersionFile = 'npm_version.json';
async function getLatestVersion(packageName) {
    try {
        const { data } = await axios.get(`https://registry.npmjs.org/${packageName}/latest`);
        return data.version;
    }
    catch (error) {
        console.error(`Error getting latest version of ${packageName}: ${error}`);
        return null;
    }
}
async function updatePackageVersion(packageName, version) {
    try {
        const fileData = JSON.parse(fs.readFileSync(npmVersionFile, 'utf8'));
        if (fileData[packageName] === version)
            return;
        fileData[packageName] = version;
        fs.writeFileSync(npmVersionFile, JSON.stringify(fileData, null, 2));
        console.log(`Successfully updated ${packageName} version to ${version} in ${npmVersionFile}`);
    }
    catch (error) {
        console.error(`Error updating ${packageName} version in ${npmVersionFile}: ${error}`);
    }
}
async function main() {
    try {
        const fileData = JSON.parse(fs.readFileSync(npmVersionFile, 'utf8'));
        for (const packageName of packageNames) {
            const latestVersion = await getLatestVersion(packageName);
            if (!latestVersion)
                continue;
            updatePackageVersion(packageName, latestVersion);
        }
    }
    catch (error) {
        console.error(`Error reading ${npmVersionFile}: ${error}`);
    }
}
main();
