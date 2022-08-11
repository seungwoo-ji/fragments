# 1. POST a new JSON fragment as an authorized user
POST http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjNAZW1haWwuY29tOnBhc3N3b3JkMw==
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
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"
fragment1_ownerId: jsonpath "$.fragment.ownerId"
fragment1_created: jsonpath "$.fragment.created"
fragment1_updated: jsonpath "$.fragment.updated"
fragment1_type: jsonpath "$.fragment.type"
fragment1_size: jsonpath "$.fragment.size"
fragment1: jsonpath "$.fragment"

# 2. POST another JSON fragment as an authorized user
POST http://localhost:8080/v1/fragments
# user1@email.com:password1
Authorization: Basic dXNlcjNAZW1haWwuY29tOnBhc3N3b3JkMw==
Content-Type: text/plain
```This is another fragment!```

HTTP/1.1 201
[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[A-Za-z0-9_-]+$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.size" == 25
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"
fragment2_ownerId: jsonpath "$.fragment.ownerId"
fragment2_created: jsonpath "$.fragment.created"
fragment2_updated: jsonpath "$.fragment.updated"
fragment2_type: jsonpath "$.fragment.type"
fragment2_size: jsonpath "$.fragment.size"
fragment2: jsonpath "$.fragment"

# 3. Try to GET the user's fragments with expand 
GET http://localhost:8080/v1/fragments?expand=1
Authorization: Basic dXNlcjNAZW1haWwuY29tOnBhc3N3b3JkMw==

HTTP/1.1 200
Content-Type: application/json; charset=utf-8
[Asserts]
jsonpath "$.fragments" isCollection
jsonpath "$.fragments[0].id" == {{fragment1_id}}
jsonpath "$.fragments[0].ownerId" == {{fragment1_ownerId}}
jsonpath "$.fragments[0].created" == {{fragment1_created}}
jsonpath "$.fragments[0].updated" == {{fragment1_updated}}
jsonpath "$.fragments[0].type" == {{fragment1_type}}
jsonpath "$.fragments[0].size" == {{fragment1_size}}
jsonpath "$.fragments[1].id" == {{fragment2_id}}
jsonpath "$.fragments[1].ownerId" == {{fragment2_ownerId}}
jsonpath "$.fragments[1].created" == {{fragment2_created}}
jsonpath "$.fragments[1].updated" == {{fragment2_updated}}
jsonpath "$.fragments[1].type" == {{fragment2_type}}
jsonpath "$.fragments[1].size" == {{fragment2_size}}


