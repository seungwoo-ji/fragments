# Authenticated POST with WEBP TYPE to /v1/fragments
POST http://localhost:8080/v1/fragments
# user1@email.com:password1
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
# We're sending a webp image 
Content-Type: image/webp
file,tests/images/webp-image.webp;

# 1. We expect to get back an HTTP 201
HTTP/1.1 201
# We have various assertions about the response that we want to check
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
jsonpath "$.fragment.type" == "image/webp"
jsonpath "$.fragment.size" > 0
# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"

# 2. Try to GET the fragment we just posted by its URL
GET {{url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
Content-Type: image/webp
[Asserts]
# Check if the response body includes image 
file,tests/images/webp-image.webp;

# 3. Try to GET the created WEBP fragment with WEBP extension
GET {{url}}.webp
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
Content-Type: image/webp
[Asserts]
# Check if the response body includes image 
file,tests/images/webp-image.webp;

# 4. Try to GET the created WEBP fragment with PNG extension
GET {{url}}.png
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
Content-Type: image/png
[Asserts]
# Check if the response body includes image 
bytes exists

# 5. Try to GET the created WEBP fragment with JPEG extension
GET {{url}}.jpeg
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
Content-Type: image/jpeg
[Asserts]
# Check if the response body includes image 
bytes exists

# 6. Try to GET the created WEBP fragment with GIF extension
GET {{url}}.gif
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
Content-Type: image/gif
[Asserts]
# Check if the response body includes image 
bytes exists
