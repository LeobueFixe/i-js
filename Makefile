build:
    docker build -t lab-node .

run:
    docker run -it --name lab-container lab-node

rerun:
    docker rm -f lab-container || true
    docker run -it --name lab-container lab-node

clean:
    docker rm -f lab-container || true
    docker rmi -f lab-node || true

ps:
    docker ps -a

logs:
    docker logs lab-container
