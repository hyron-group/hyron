As can be said, service is the heart of the application. All the components that hyron provides are aimed at services.

You can develop hyron under any model you want. But service orientation is one of the suggestions that it might be useful to you because its flexibility and efficiency

## What is a service ?

-   A service is a group of functions that address a specific problem.
    Example. with an authenticate service will include login, signup, logout, changePassword, etc

-   A service should keep it independent of the external environment. By turning it into a black box.

-   Other services should not be accessed in depth. Which need through a programmable interface is provided outside with the necessary methods

-   A service should have its own architecture within it, making it easier to develop, like **Model** - **Controller** - **Interface**

    -   **Model** : defines functions that interact with the database, or data model, data mapping
    -   **Controller** : defines functions to process information and return results, based on business logic
    -   **Interface** : Application programming interfaces, used to interact with other services, and to import into the hyron framework

-   Each service should define its own database (if needed).

## Why we used service ?

An application with service-oriented architecture (SOA) will help you

-   Easy to manage source code
-   Easy to develop independently
-   Easy to upgrade and maintain
-   Easy to reuse and share

## Basic concepts

**1. Hyron support very well for *Service Oriented Architecture***

**2. You can choose any development model that you like**

**3. A service is supported by hyron if it is packaged with the requestConfig() method**

**4. Hyron also provides unofficial support for special services without declaring requestConfig() method**

-   in this case, it need to wrap into a function with param is (app, config)
-   hyron can not handle these services closely, so some plugins or addons may not work on these packages.


**5. You can easily switch from hyron to other frameworks**

The hyron is designed to help significantly eliminate dependence on the platform. So, you can switch from hyron to other frameworks extremely easily, without requiring code rewriting.

Losing your trust is a big loss for us in our effort to build a strong community, and the dream of a great platform for programmers.

So, we are looking forward to receiving feedback from you, to improve the service better. Please send back to hyron.dev@gmail.com

---

Next step : [Build a service with hyron]()
