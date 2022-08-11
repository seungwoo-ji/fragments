
# Unauthenticated DELETE
DELETE http://localhost:8080/v1/fragments/fragment-id
Authorization: Basic invalid-token

# We should get back an HTTP 1.1 401 response
HTTP/1.1 401
