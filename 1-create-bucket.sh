#!/bin/bash
BUCKET_NAME=lamdacodesrc
echo $BUCKET_NAME > bucket-name.txt
aws s3 mb s3://$BUCKET_NAME
