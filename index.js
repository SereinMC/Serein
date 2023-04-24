import { magenta, accept } from 'chalk';
import { writeJSON } from 'jsonfile';
import { exec } from 'child_process';
import del from 'del';

interface Version {
  mode: string;
  manifestVersion?: string;
  npmVersion?: string;
}

interface Information {
  isDefault: boolean;
  manifest: {
    dependencies: {
      [key: string]: {
        version: string;
      };
    };
  };
  packages: {
    dependencies: {
      [key: string]: string;
    };
  };
  versions: {
    [key: string]: string;
  };
  npmVersions: {
    [key: string]: string;
  };
}

function askYes(question: string): string {
  // Implement your askYes function
}

function askVersion(current: string): Version {
  // Implement your askVersion function
}

async function switchVersions(informations: Information): Promise<void> {
  // Iterate over all dependencies
  for (const dependencyName of informations.manifest.dependencies) {
    // Get the current dependency name
    const current = dependencyName.split('@')[0];

    // Check if the current dependency name contains the minecraft namespace
    if (current.search(/@minecraft/) !== -1) {
      // Ask the user if they want to switch versions
      const switchYes = await askYes(`Do you want to switch versions dependent on ${magenta(current)}?`);

      // If the user says yes, switch the version
      if (switchYes) {
        // Get the version to switch to
        let version: Version = { mode: 'latest' };
        if (!informations.isDefault) version = await askVersion(current);

        // Set the new version
        informations.manifest.dependencies[dependencyName].version =
          version.mode === 'latest'
            ? informations.versions[current]
            : version.manifestVersion!;
        informations.packages.dependencies[current] =
          version.mode === 'latest'
            ? informations.npmVersions[current]
            : version.npmVersion!;

        // Log the new version
        console.log(
          `Dependency ${magenta(current)} update to ${accept(
            informations.manifest.dependencies[dependencyName].version
          )}`
        );
      }
    }
  }

  // Write the manifest to disk
  await writeJSON('./behavior_packs/manifest.json', informations.manifest);

  // Write the package.json to disk
  await writeJSON('package.json', informations.packages);

  // Delete the node_modules directory
  await del.sync('node_modules');

  // Delete the package-lock.json file
  await del.sync('package-lock.json');

  // Run npm install
  await exec('npm install');
}
