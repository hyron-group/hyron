appcfg.ini is file contain all of config of app, include this app, plugins, and services


## Basic concepts

1. It loaded at runtime
- appcfg will be convert into js object type and saved as scope at runtime

**2. It can be retrieve in anywhere**
   
- in plugins, it can be retrieve by argument at index 4th : function (req, res, prev, config)
- in unofficial-service, it can be retrieve by argument at index 2th : function (app, config)
- in normal service, it can be retrieve thought by hyron.getConfig() method

**3. It can be change value as temporary**
- You can change default value of config by hyron.getConfig

**4. It can be used by it self plugins**
- If plugins developed by hyron organization, it used this file to auto run on runtime
- If it declared with \<parent\> (like key=\<parent\>) properties, it can be overwrite by app-level appcfg. So, you can  custom plugins by this way

**5. appcfg only work if it set from root dir**
- just keep appcfg.ini from root