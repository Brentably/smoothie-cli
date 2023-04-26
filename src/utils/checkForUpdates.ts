import axios from 'axios';
import { updateEnvFile } from '../state';

export async function checkForUpdates(version: string) {
  try {
    const packageName = 'smoothie-cli'; // Replace with your package name
    const response = await axios.get(`https://registry.npmjs.org/${packageName}/latest`);
    const latestVersion = response.data.version;

    if (version !== latestVersion) {
      updateEnvFile('LATEST_VERSION', latestVersion)
    }
  } catch (error) {
    console.error('Error fetching package information from NPM registry:', error);
  }
}