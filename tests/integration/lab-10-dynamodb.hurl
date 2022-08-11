# 1. POST a new JSON fragment as an authorized user
POST http://localhost:8080/v1/fragments
# user1@email.com:password1
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
Content-Type: application/json
{
  "service": "DynamoDB"
}

# 2. We expect to get back an HTTP 201
HTTP/1.1 201
[Asserts]
# The Location header should look like what we expect (including the fragment id)
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
# Our fragment ids use https://www.npmjs.com/package/nanoid
jsonpath "$.fragment.id" matches "^[A-Za-z0-9_-]+$"
# Our ownerId hash is a hex encoded string
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
# Basic check for the presence of created and updated date strings.
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "application/json"
# 27 is the length of our fragment data
jsonpath "$.fragment.size" == 27 
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"
fragment1_ownerId: jsonpath "$.fragment.ownerId"
fragment1_created: jsonpath "$.fragment.created"
fragment1_updated: jsonpath "$.fragment.updated"
fragment1_type: jsonpath "$.fragment.type"
fragment1_size: jsonpath "$.fragment.size"

# 3. Try to GET the fragment info we just posted by its URL/info
GET {{fragment1_url}}/info
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
Content-Type: application/json; charset=utf-8
[Asserts]
jsonpath "$.fragment.id" == {{fragment1_id}}
jsonpath "$.fragment.ownerId" == {{fragment1_ownerId}}
jsonpath "$.fragment.created" == {{fragment1_created}}
jsonpath "$.fragment.updated" == {{fragment1_updated}}
jsonpath "$.fragment.type" == {{fragment1_type}}
jsonpath "$.fragment.size" == {{fragment1_size}}

# 4. POST a MARKDOWN fragment as an authorized user
POST http://localhost:8080/v1/fragments
# user1@email.com:password1
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
Content-Type: text/markdown 
```DynamoDB is **great**.```

# 5. We expect to get back an HTTP 201
HTTP/1.1 201
[Asserts]
# The Location header should look like what we expect (including the fragment id)
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
# Our fragment ids use https://www.npmjs.com/package/nanoid
jsonpath "$.fragment.id" matches "^[A-Za-z0-9_-]+$"
# Our ownerId hash is a hex encoded string
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
# Basic check for the presence of created and updated date strings.
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "text/markdown"
# 22 is the length of our fragment data
jsonpath "$.fragment.size" == 22 
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"
fragment2_ownerId: jsonpath "$.fragment.ownerId"
fragment2_created: jsonpath "$.fragment.created"
fragment2_updated: jsonpath "$.fragment.updated"
fragment2_type: jsonpath "$.fragment.type"
fragment2_size: jsonpath "$.fragment.size"

# 6. Try to GET the second fragment info we just posted by its URL/info
GET {{fragment2_url}}/info
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
Content-Type: application/json; charset=utf-8
[Asserts]
jsonpath "$.fragment.id" == {{fragment2_id}}
jsonpath "$.fragment.ownerId" == {{fragment2_ownerId}}
jsonpath "$.fragment.created" == {{fragment2_created}}
jsonpath "$.fragment.updated" == {{fragment2_updated}}
jsonpath "$.fragment.type" == {{fragment2_type}}
jsonpath "$.fragment.size" == {{fragment2_size}}

# 7. Try to GET all of the fragments for the same authorized user without expanding them
GET http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
Content-Type: application/json; charset=utf-8
[Asserts]
jsonpath "$.status" == "ok" 
jsonpath "$.fragments" includes {{fragment1_id}}
jsonpath "$.fragments" includes {{fragment2_id}}

# 8. Try to DELETE the first fragment that we created
DELETE {{fragment1_url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
Content-Type: application/json; charset=utf-8
Content-Length: 15 
[Asserts]
jsonpath "$.status" == "ok"

# 9. Try to GET the first fragment again
GET {{fragment1_url}}/info
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 404 
Content-Type: application/json; charset=utf-8
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 404 

# 10. Try to GET all of the fragments for the second time
GET http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
Content-Type: application/json; charset=utf-8
[Asserts]
jsonpath "$.status" == "ok" 
jsonpath "$.fragments" not includes {{fragment1_id}}
jsonpath "$.fragments" includes {{fragment2_id}}

