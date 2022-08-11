# Unauthenticated UPDATE
PUT http://localhost:8080/v1/fragments/fragment-id
Authorization: Basic invalid-token
# We're sending a plain text fragment
Content-Type: text/plain
```This is a fragment!```

# We should get back an HTTP 1.1 401 response
HTTP/1.1 401
