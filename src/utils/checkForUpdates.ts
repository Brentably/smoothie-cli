import axios from 'axios';
import { updateEnvFile } from '../state';

export async function checkForUpdates(version: string) {
  try {
    const packageName = 'smoothie-cli'; // Replace with your package name
    const response = await axios.get(`https://registry.npmjs.org/${packageName}/latest`);
    const latestVersion = response.data.version;
    console.log('hello', latestVersion, version)
    if (version !== latestVersion) {
      updateEnvFile('LATEST_VERSION', latestVersion)
      console.log('logs: updated version in .env')
    }
  } catch (error) {
    console.error('Error fetching package information from NPM registry:', error);
  }
}