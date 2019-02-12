const hyron = require("./ModulesManager");
const childProcess = require("child_process");
const chalk = require("chalk");
var fs = require("fs");
const RELATIVE_PATH_REG = /^[\.\/]+/;
const INSTALLED_REG = /Direct dependencies[\s]*└─[\s]*(([\w\d@\-_]+)@)/;

(() => {
    childProcess.execSync("npm i -g yarn");
})();


function applyChange(meta, changedMeta) {
    for (var changedField in changedMeta) {
        meta[changedField] = changedMeta[changedField];
    }
}

function registerInstance(appMeta) {
    var server = appMeta.server;
    if (server == null) {
        server = appMeta.base_url;
    }
    var appInstance = hyron.getInstance(server);
    appInstance.setting(appMeta.setting);
    appInstance.enableAddons(appMeta.addons);
    appInstance.enablePlugins(appMeta.plugins);
    appInstance.enableServices(appMeta.services);
    appInstance.startServer();
}

function getMissingPackage(meta) {
    const npmPackage = JSON.parse(fs.readFileSync("package.json").toString());
    var dependencies = {
        ...npmPackage.dependencies,
        ...npmPackage.devDependencies,
        ...npmPackage.peerDependencies,
        ...npmPackage.bundledDependencies
    };
    var installedPackage = Object.keys(dependencies);
    var missingPackage = {};
    for (var packageName in meta) {
        var packageLink = meta[packageName];
        if (!installedPackage.includes(packageName) &&
            !installedPackage.includes(packageLink) &&
            !RELATIVE_PATH_REG.test(packageLink)) {
            missingPackage[packageName] = meta[packageName];
        }
    }
    return missingPackage;
}

function downloadMissingPackage(name, url) {
    return new Promise((resolve, reject) => {
        console.info(chalk.cyanBright(`Lockup "${name}"`));
        childProcess.exec(`yarn add ${url}`, (err, sto, ste) => {
            if (err == null) {
                // get installed package name
                var match = INSTALLED_REG.exec(sto);
                var packageName;
                if (match != null) {
                    packageName = match[2];
                }
                resolve(name, packageName);
            } else {
                reject(err);
            }
        });
    });
}

function startDownload(packageList) {
    var realPackagesName = {};
    var jobs = [];

    for (var packageName in packageList) {
        jobs.push(
            downloadMissingPackage(packageName, packageList[packageName])
            .then((displayName, realName) => {
                console.log(chalk.green("Installed : " + displayName));
                realPackagesName[displayName] = realName;
            }));
    }

    return new Promise((resolve) => {
        return Promise.all(jobs).then(() => {
            resolve(realPackagesName);
        }).catch((err) => {
            console.error(chalk.red("[error] has problem : " + err.message));
        });
    })
}


function loadFromObject(appMeta) {
    var missingAddons = getMissingPackage(appMeta.addons);
    var missingPlugins = getMissingPackage(appMeta.plugins);
    var missingServices = getMissingPackage(appMeta.services);

    var missingPackages = [
        ...Object.keys(missingAddons),
        ...Object.keys(missingPlugins),
        ...Object.keys(missingServices),
    ];
    if (missingPackages.length == 0) {
        registerInstance(appMeta);
    } else {
        console.warn(chalk.gray(`Missing (${missingPackages.length}) : ${missingPackages}`));
        console.log(chalk.magenta("Installing missing package ..."));
        Promise.all([
            startDownload(missingAddons),
            startDownload(missingPlugins),
            startDownload(missingServices),
        ]).then((
            downloadedAddons,
            downloadedPlugins,
            downloadedServices) => {
            applyChange(appMeta.addons, downloadedAddons);
            applyChange(appMeta.plugins, downloadedPlugins);
            applyChange(appMeta.services, downloadedServices);

            console.log(chalk.green("All package downloaded !\n"));
            console.log("------------------------\n");

            if (appMeta.services != null) {
                registerInstance(appMeta);
            } else if (appMeta.addons != null) {
                hyron.enableGlobalAddons(appMeta.addons);
            }

        });
    }
}


function loadFromFile(buildPath) {
    var fileData = fs.readFileSync(buildPath).toString();
    var appMeta = JSON.parse(fileData);
    if (appMeta instanceof Array) {
        appMeta.forEach((child) => {
            if (typeof child == "string")
                loadFromFile(child);
            else if (typeof child == "object") {
                loadFromObject(child);
            }
        });
    } else if (appMeta instanceof Object) {
        loadFromObject(appMeta);
    }
}


module.exports = loadFromFile;