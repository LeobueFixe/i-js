IMG_NAME = lab-node
CTN_NAME = lab-container

build:
    docker build -t $(IMG_NAME) .

run:
    docker run -it --name $(CTN_NAME) $(IMG_NAME)

rerun:
    docker rm -f $(CTN_NAME) || true
    docker run -it --name $(CTN_NAME) $(IMG_NAME)

clean:
    docker rm -f $(CTN_NAME) || true
    docker rmi -f $(IMG_NAME) || true

ps:
    docker ps -a

logs:
    docker logs $(CTN_NAME)
