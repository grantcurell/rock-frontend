let CLUSTERED_STORAGE_VALIDATED: boolean;
let ELASTICSEARCH_VALIDATED: boolean;
let SENSOR_RESOURCES_VALIDATED: boolean;

CLUSTERED_STORAGE_VALIDATED = false;
ELASTICSEARCH_VALIDATED = false;
SENSOR_RESOURCES_VALIDATED = false;

//TODO the use of globals is bad practive and it is causing the ExpressionChangedAfterItHasBeenCheckedError
export function SetClusteredStorageValidated(newValue: boolean){
    CLUSTERED_STORAGE_VALIDATED = newValue;
}

export function SetElasticSearchValidated(newValue: boolean){
    ELASTICSEARCH_VALIDATED = newValue;
}

export function SetSensorResourcesValidated(newValue: boolean){
    SENSOR_RESOURCES_VALIDATED = newValue;
}

export function GetClusteredStorageValidated(){
    return CLUSTERED_STORAGE_VALIDATED;
}

export function GetElasticSearchValidated(){
    return ELASTICSEARCH_VALIDATED;
}

export function GetSensorResourcesValidated(){
    return SENSOR_RESOURCES_VALIDATED;
}