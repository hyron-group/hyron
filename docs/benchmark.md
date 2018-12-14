## Environment

-   **tools** : wrk
-   **time** : 12/2018
-   **device** : HP 15R-020TU, corei5-4400, 8GB ram
-   **opera-system** : Windows 10 with Ubuntu 18.04 installed (developer-mode)
-   **test case** :
    -   **method** : get
    -   **result** : return "hello " + query.name
-   **test method** :
    -   remove the first result (cache time)
    -   average of 5 runs
    -   Pause all running applications
-   **test unit** : request per second (rps)

## Load test

-   **nodejs** : ~13,500 rps
-   **hyron** : ~11,700 rps
-   **express** : ~6,400 rps

## Conclude

-   hyron is about 83-90% equivalent to the raw node
-   hyron is about 2 times more efficient than express
