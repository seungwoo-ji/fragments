# 1. Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
Content-Type: text/plain
```This is a fragment!```

HTTP/1.1 201
[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[A-Za-z0-9_-]+$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.size" == 19
# Capture the Location URL into a variable named `url`
[Captures]
fragment_url: header "Location"
fragment_id: jsonpath "$.fragment.id"
fragment_ownerId: jsonpath "$.fragment.ownerId"
fragment_created: jsonpath "$.fragment.created"
fragment_updated: jsonpath "$.fragment.updated"
fragment_type: jsonpath "$.fragment.type"
fragment_size: jsonpath "$.fragment.size"

# 2. Try to GET info the fragment we just posted by its URL
GET {{fragment_url}}/info
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
Content-Type: application/json; charset=utf-8
[Asserts]
jsonpath "$.fragment.id" == {{fragment_id}}
jsonpath "$.fragment.ownerId" == {{fragment_ownerId}}
jsonpath "$.fragment.created" == {{fragment_created}}
jsonpath "$.fragment.updated" == {{fragment_updated}}
jsonpath "$.fragment.type" == {{fragment_type}}
jsonpath "$.fragment.size" == {{fragment_size}}

