# Hobolink Scraper

Scraper to perform data extraction from weather stations connected to the Hobolink system.

## How to Run locally

How to run scraper locally:

* `docker-compose up -d`
* `yarn install`
* `export CONDUCTOR_URI=http://localhost:8080`
* `export AGRODATA_URI=http://localhost:8000`
* `yarn start`

How to run scraper with docker:

* `docker-compose up --build`

## Usage

Regardless of how you run (locally or using docker) you should trigger scrapper task on Conductor using the following request using your **Username**,**Password** and required **Date**:

- Scraps data from hobolink software extracting readouts from a specific day
```
curl -X POST \
  http://localhost:8080/api/workflow \
  -H 'Accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "hobolink_date",
    "version": 1,
    "input": {
        "username": "user1",
        "password": "pass1",
        "date": "2019-07-02"
    }
}'
```