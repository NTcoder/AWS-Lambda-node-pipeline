# AWS Lamda in Node 12.x runtime with AWS API-gateway, MongoDB Cloud Atlas and AWS CloudFormation scripts #

This repo is a template from AWS sample for Node. This is specially tuned to setup NodeJS with MongoDB.

In this specific usecase, one lambda function fetches the current sensor data from MongoDB database, the other lambda function calculates the average temperature over a the pre-defined average window.

## Timeseries sensor data in MongoDB ##

To store time series data in MongoDB database, I have used this[https://www.mongodb.com/blog/post/time-series-data-and-mongodb-part-2-schema-design-best-practices] blog from MongoDB.

## Pre-requisite ##

* Setup MongoDB Cloud Atlas account with cloud username
* Create .env file under `/function` folder as per below keys:

```sh
MDB_USERNAME=your-mongo-db-username
MDB_PASSWORD=your-mongo-db-password
MDB_CLUSTER=your-mongo-sb-cluster-name
MDB_NAME=your-mongo-db-name
MDB_COLLECTION=your-mongo-db-collection-name
AVG_WINDOW=3600

```

* AWS Account with API-key and Secret ready

### How to use simulator to generate IoT sensor data ###

Under /data_gen/datagen.py, edit the master settings in the main function and MongoDB uri.

NOTE : This will insert 7 days of sensor data (between 25.0 and 45.0) for a device. A copy of it will be saved locally if write_file is 1. TO optimize database desing and CRUD operations, s_count_max should be adjusted.

To create data two sensors, you have to run script two times.

```python
python3.7 datagen.py
```

### How do I setup dev. env. locally in Ubuntu ###

* Install VS Code. <https://code.visualstudio.com/Download>
* Setup environment as per the setup script

```sh
./0-setupenv.sh
```

NOTE : Workarounds in the script.

* AWS Cli should be installed as local package
* AWS SAM CLI should be installed with python3.7/python3.6

### How to build locally ###

```sh
./6-deploy-local.sh
```

## Deploy to cloud ##

### Create AWS S3 bucket for code versioning ###

NOTE : This is a one time activity only

```sh
./1-create-bucket.sh
```

### Deploy updated code to API Gateway and AWS Lamda ###

```sh
./2-deploy.sh
```

NOTE : AWSCLI, SAM CLI should be pre-configured. with credentials configured for this to work.

### Test deployment on cloud ###

```sh
./4-get.sh
```

### Test deployment local ###

```sh
./7-test_local.sh
```

## Who do I talk to ##

* navadiatarun@gmail.com

### Improvements ###

* The database connection time takes about 1 second inside lamda. This can be improved with connection pooling.
* Build Lambda layer so that node_modules are not required everytime.
