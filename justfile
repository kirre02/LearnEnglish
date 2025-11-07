default: dev

docker:
    docker compose up -d 

frontend:
    cd frontend && npm run dev

backend:
    cd backend && npm run dev


dev: docker
     just -f ./justfile frontend & \
     just -f ./justfile backend & \
     wait
