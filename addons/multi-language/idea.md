# Introduction

this addons used to extend the capabilities of the application. Allows the app to run based on multiple languages. 
It will be used to develop microservice architecture applications that some services can be developed by different languages, such as Java or C ++ for high-performance computing, python or Lisp used to develop modular modules Artificial intelligence, or other languages, etc

# Benefit
- Exploit the capabilities of different languages
- Making code simpler
- Help increase processing performance
- Subject to strict management of the hyron framework, thereby allowing other addons or plugins to easily manage peripheral modules
  
# Main standards
- Languages can be separated into modules that users can install to use, called connectors
- Different languages can call each other directly through the native interface (terminal)
- The connectors when installing need to install with devkit
- In the case of languages that are not supported by the platform, or running on another server or docker container, support with the interface can help connect to other services (TCP / IPC).
- The connectors should be designed to be tightly managed by hyron (especially: dependencies, location, HyronService interface, config)