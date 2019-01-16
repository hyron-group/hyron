var hyron = require('./moduleManager');
var child_process = require('child_process');
var fs = require('fs');
var path = require('path');
var homeDir = require('../lib/homeDir');


(() => {
    child_process.execSync("npm i -g yarn");
})()

function loadFromFile(buildPath) {
    var appMeta = require(path.join(homeDir, buildPath));
    if (appMeta instanceof Array) {
        appMeta.forEach((childPath) => {
            loadFromFile(childPath);
        });
    } else if (appMeta instanceof Object) {
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
            console.warn(`Missing (${missingPackages.length}) : ${missingPackages}`);
            console.log("Installing missing package ...");
            Promise.all([
                downloadJobs(missingAddons),
                downloadJobs(missingPlugins),
                downloadJobs(missingServices),
            ]).then((downloadedAddons,
                downloadedPlugins,
                downloadedServices) => {
                applyChange(appMeta.addons, downloadedAddons);
                applyChange(appMeta.plugins, downloadedPlugins);
                applyChange(appMeta.services, downloadedServices);

                console.log("All package downloaded !\n");
                console.log('------------------------\n')

                registerInstance(appMeta);
            })
        }
    }
}

function applyChange(meta, changedMeta) {
    for (var changedField in changedMeta) {
        meta[changedField] = changedMeta[changedField];
    }
}

function registerInstance(appMeta) {
    var appInstance = hyron.getInstance(appMeta.base_url);
    appInstance.setting(appMeta.setting);
    appInstance.enableAddons(appMeta.addons);
    appInstance.enablePlugins(appMeta.plugins);
    appInstance.enableServices(appMeta.services);
    appInstance.startServer();
}

function getMissingPackage(meta) {
    const npmPackage = JSON.parse(fs.readFileSync('package.json').toString());
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
            !/^[\.\/]+/.test(packageLink)) {
            missingPackage[packageName] = meta[packageName];
        }
    }
    return missingPackage;
}

function downloadMissingPackage(name, url) {
    return new Promise((resolve, reject) => {
        console.log(`lockup '${name}'`);
        child_process.exec(`yarn add ${url}`, (err, sto, ste) => {
            if (err == null) {
                // get installed package name
                var reg = /Direct dependencies[\s]*└─[\s]*(([\w\d@\-_]+)@)/;
                var match = reg.exec(sto);
                var packageName;
                if (match != null)
                    packageName = match[2];
                resolve(name, packageName);
            } else reject(err);
        });
    });
}

function downloadJobs(packageList) {
    var realPackagesName = {};
    var jobs = [];

    for (var packageName in packageList) {
        jobs.push(
            downloadMissingPackage(packageName, packageList[packageName])
            .then((displayName, realName) => {
                console.log("installed : " + displayName);
                realPackagesName[displayName] = realName;
            }))
    }

    return new Promise(resolve => {
        return Promise.all(jobs).then(() => {
            resolve(realPackagesName);
        }).catch(err => {
            console.log("has problem : " + err.message);
        });
    })
}


module.exports = loadFromFile;