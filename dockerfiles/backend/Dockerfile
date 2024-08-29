FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update -y && apt-get install -y --no-install-recommends ca-certificates curl wget git unzip zip software-properties-common apt-transport-https gnupg2


RUN mkdir -p /backend-build
WORKDIR /backend-build

RUN wget https://go.dev/dl/go1.22.6.linux-amd64.tar.gz
RUN tar -C /usr/local -xzf go1.22.6.linux-amd64.tar.gz
RUN rm go1.22.6.linux-amd64.tar.gz

RUN echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc

RUN git clone https://github.com/takiyo0/compfest ./compfest

WORKDIR /backend-build/compfest

RUN go mod download
RUN go build start-backend.go start-backend
RUN chmod +x start-backend

FROM ubuntu:20.04

RUN apt-get update -y && apt-get install -y --no-install-recommends ca-certificates
RUN mkdir -p /backend
WORKDIR /backend
COPY --from=0 /backend-build/compfest/start-backend /backend/start-backend
RUN chmod +x /backend/start-backend

EXPOSE 8085

CMD ["/backend/start-backend"]

