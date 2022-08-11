# 1. GET the fragment info by its URL
GET http://localhost:8080/v1/fragments/invalid-id/info
Authorization: Basic invalid-token

# We should get back an HTTP 1.1 401 response
HTTP/1.1 401
