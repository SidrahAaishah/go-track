# Stage 1: Build
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o go-track .

# Stage 2: Run
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/go-track .
# You might need SSL certs
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
EXPOSE 8080
CMD ["./go-track"]