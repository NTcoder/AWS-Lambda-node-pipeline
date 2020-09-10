import json
from datetime import datetime as datetime
from datetime import timedelta
from random import uniform
import time

from pymongo import MongoClient
import dns # required for connecting with SRV

class Connect(object):
    @staticmethod    
    def get_connection():
        ###############################
        ## MONGO DB URI
        ###############################

        return MongoClient("mongodb+srv://<uasername>:<password>@<cluster-name>/<collection-name>?retryWrites=true&w=majority") 

def document_day(today_date_obj):
    samples = []
    documents = []
    today_Date_loop =  datetime.strftime(today_date_obj, "%Y-%m-%d")
    start_time_int = int((today_date_obj - datetime(1970,1,1)).total_seconds()) + 1
    count = 1
    while (count <= 86400):
        # generate a random temperature data between 25 and 45
        rand_temp = uniform(25.0,45.0)
        #print(format(round(rand, 2)))
        
        sample = {str(start_time_int + len(samples)):format(round(rand_temp, 2))}
        samples.append(sample)
        if len(samples) == s_count_max :
            #print(samples)
            document = {
                "_id": format(round(time.time(), 5)),
                "day":today_Date_loop,
                "device":device_name,
                "first":start_time_int,
                "last":start_time_int + s_count_max -1,
                "s_count": len(samples),
                "samples":samples
            }
            documents.append(document)
            keys.append(document['_id'])
            start_time_int = start_time_int + s_count_max
            samples = []
        # post increment count and sub_count
        count += 1          
    # add remaining keys   
    if len(samples) > 0 :        
        document = {
            "_id": format(round(time.time(), 5)),
            "day":today_Date_loop,
            "device":device_name,
            "first":start_time_int,
            "last":start_time_int + len(samples),
            "s_count": len(samples),
            "samples":samples
        }
        documents.append(document)
        keys.append(document['_id'])            
    #print(documents)
    return documents

if __name__ == "__main__":

    #################################
    ## CONFIGURE THE BELOW SETTINGS FOR DATA GENERATION
    #################################

    start_date = '2020-08-30'
    days = 7
    write_to_file = 1
    s_count_max = 200
    device_name = "Covilha"

    #################################

    connection = Connect.get_connection()
    print("Found databases : ", connection.list_database_names())

    vopakdb = connection["vopak"]
    collections = vopakdb.list_collection_names()
    if 'temperature' in collections:
        temperature_collection = vopakdb['temperature']
        #temperature_collection.drop()
    temperature_collection = vopakdb['temperature']
    
    documents_all = []
    keys = []      
    today_date_obj_start = datetime.strptime(start_date, "%Y-%m-%d")
    print(today_date_obj_start)

    #iterate over number of days 
    for _ in range(days):
        documents = []
        documents = document_day(today_date_obj_start)
        x = temperature_collection.insert_many(documents)
        documents_all = documents_all + documents
        today_date_obj_start = today_date_obj_start + timedelta(days=1)
        
    if write_to_file == 1 :
        with open(start_date + '_' + str(days) + '.json', 'w') as f:
            f.write(json.dumps(documents_all))
    
    connection.close()
    print("Inserted keys in DB", keys)
