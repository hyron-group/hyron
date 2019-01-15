var hyron = require('./moduleManager');
var child_process = require('child_process');
var fs = require('fs');

(() => {
    child_process.execSync("npm i -g yarn");
})()

function loadFromFile(path) {
    var appMeta = require(path);
    if (appMeta instanceof Array) {
        appMeta.forEach((childPath) => {
            loadFromFile(childPath);
        })
    } else if (appMeta instanceof Object) {
        var missingAddons = getMissingPackage(appMeta.addons);
        var missingPlugins = getMissingPackage(appMeta.plugins);
        var missingServices = getMissingPackage(appMeta.services);

        var missingPackages = [...missingAddons, ...missingPlugins, missingServices];
        console.warn(`Missing (${missingPackages.length}) : ${missingPackages}`);
        if (missingPackages.length == 0) {
            registerInstance(appMeta);
        } else {
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
    throw new TypeError(`can't load hyron build file`);
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
    const dependencies = {
        ...npmPackage.dependencies,
        ...npmPackage.devDependencies,
        ...npmPackage.peerDependencies,
        ...npmPackage.bundledDependencies
    };
    var installedPackage = Object.keys(dependencies);
    var missingPackage = {};
    for (var packageName in meta) {
        if (!installedPackage.includes(packageName) &&
            !packageName.startsWith(/[.\/]+/)) {
            missingPackage[packageName] = meta[packageName];
        }
    }
    if (Object.keys(missingPackage).length == 0) return null;
    return missingPackage;
}

function downloadMissingPackage(url) {
    return new Promise((resolve, reject) => {
        child_process.exec(`yarn add ${url}`, (err, sto, ste) => {
            if (err == null) {
                // get installed package name
                var reg = /Direct dependencies[\s]*└─[\s]*(([\w\d@\-_]+)@)/;
                var match = reg.exec(sto);
                var packageName;
                if (match != null)
                    packageName = match[2];
                resolve(packageName);
            } else reject(err);
        });
    });
}

function downloadJobs(packageList) {
    var realPackagesName = {};
    var jobs = [];

    for (var packageName in packageList) {
        jobs.push(
            downloadMissingPackage(packageList[packageName])
            .then((realName) => {
                console.log("installed : "+realName);
                realPackagesName[packageName] = realName;
            }))
    }

    return new Promise(resolve => {
        return Promise.all(jobs).then(() => {
            resolve(realPackagesName);
        }).catch(err=>{
            console.log("has problem : "+err.message);
        });
    })
}

// downloadJobs({
//     param_checker: "@hyron/param-checker",
//     stringer: "@hyron/stringer",
//     hyron_cli: "https://github.com/hyron-group/hyron-cli.git"
// })

module.exports = loadFromFile;