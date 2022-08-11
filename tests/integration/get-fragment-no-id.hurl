# 1. GET the fragment by its URL
GET http://localhost:8080/v1/fragments/invalid-id
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
Content-Type: text/plain
```This fragment is changed!```

HTTP/1.1 404
Content-Type: application/json; charset=utf-8
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 404
