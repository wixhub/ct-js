/* Adds readYaml, outputYaml methods to fs-extra */
(function fsYamlPatches() {
    const fs = require('fs-extra');
    fs.readYaml = fs.readYAML = async function readYAML(file) {
        const textProjData = await fs.readFile(file, 'utf8');
        const YAML = require('js-yaml');
        return YAML.load(textProjData);
    };
    fs.outputYaml = fs.outputYAML = async function outputYAML(file, object) {
        if (!object) {
            throw new Error('[fs-extra/yamlPatch] YAML object was not passed!');
        }
        await fs.ensureFile(file);
        const YAML = require('js-yaml');
        await fs.outputFile(file, YAML.dump(object));
    };
})();
