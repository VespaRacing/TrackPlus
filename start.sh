#!/bin/bash

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed or not in PATH"
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

# Check for docker-compose or docker compose plugin
DOCKER_COMPOSE_CMD=""
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
else
    echo "Error: Neither docker-compose nor docker compose plugin is available"
    echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
fi

echo "Using Docker Compose command: $DOCKER_COMPOSE_CMD"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file is missing"
    echo "Please create a .env file with the required API configuration"
    exit 1
fi

# Build and start the containers
echo "Building and starting Docker containers..."
$DOCKER_COMPOSE_CMD up --build -d

# Wait for services to start
echo "Waiting for services to start..."
sleep 10

# Check if services are running
if $DOCKER_COMPOSE_CMD ps | grep -q "Up"; then
    echo "Services are running!"
    echo "Frontend is available at: http://localhost:8080"
    echo "Backend is available at: http://localhost:4000"
else
    echo "Error: Services failed to start properly"
    $DOCKER_COMPOSE_CMD logs
    exit 1
fi
