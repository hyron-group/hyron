# Introduction
args-loader is simple fontware plugins to load client request data into this scope if necessary

Note : This is one of the default plugins that are pre-installed by hyron

# Document
> ## $requestHeaders

Return incoming request headers

> ## $requestMethod

Return client request method

> ## $httpVersion

Return server http version

> ## $connection

Return client-server connection

> ## $socket

Return client-server socket

> ## $close

Close client connect

> ## $setTimeout

Set limited time server handling

> ## $rawUrl

Return request raw url

> ## $trailers

The request/response trailers object. Only populated at the 'end' event.