FROM ubuntu:latest

# Install Redis.

RUN apt-get update -y
RUN apt-get install -y redis-server

VOLUME ["/app"]

# Define mountable directories.
VOLUME ["/data"]

# python setup

COPY . /app
WORKDIR /app
EXPOSE 3000
EXPOSE 8000

RUN apt-get update
RUN apt-get install -y python3 python3-dev python3-pip

RUN pip3 install -r tictactoe-rest-api/requirements.txt
ENV FLASK_APP tictactoe-rest-api/session.py
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y locales

RUN sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && \
    dpkg-reconfigure --frontend=noninteractive locales && \
    update-locale LANG=en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

# npm setup

RUN mkdir /install
ADD ./tictactoe-client/package.json /install/
WORKDIR /install

RUN apt-get install -y nodejs npm

RUN npm install --silent

WORKDIR /app
COPY . /app/

CMD ["bash"]
