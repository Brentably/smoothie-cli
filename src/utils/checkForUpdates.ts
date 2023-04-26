import axios from 'axios';

export async function checkForUpdates(version: string) {
  try {
    const packageName = 'smoothie-cli'; // Replace with your package name
    const response = await axios.get(`https://registry.npmjs.org/${packageName}/latest`);
    const latestVersion = response.data.version;

    if (version !== latestVersion) {
      console.log(`A new version (${latestVersion}) is available! Please update by running: npm install -g ${packageName}`);
    }
  } catch (error) {
    console.error('Error fetching package information from NPM registry:', error);
  }
}