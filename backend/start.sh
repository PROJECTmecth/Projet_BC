#!/bin/bash

# Wait a moment for everything to initialize
sleep 5

# Start Laravel with Railway's PORT
php artisan serve --host=0.0.0.0 --port=$PORT
