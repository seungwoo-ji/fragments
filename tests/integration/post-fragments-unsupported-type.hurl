# Authenticated POST with Unsupported Fragment Type to /v1/fragments
POST http://localhost:8080/v1/fragments
# user1@email.com:password1
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
# We're sending a plain text fragment
Content-Type: text/invalid-type
# Body of the request goes in ```...``` when it's a string
```This is a fragment!```

# 1. We expect to get back an HTTP 415
HTTP/1.1 415
# We have various assertions about the response that we want to check
[Asserts]
# We expect to get back a JSON response with { "status": "error", ... }
jsonpath "$.status" == "error"
# We expect to get back a JSON response with { ..., "error": {"code": 415, ...} }
jsonpath "$.error.code" == 415
# We expect to get back a JSON response with { ..., "error": { ..., "message": "content type is not supported"} }
jsonpath "$.error.message" == "content type is not supported"
