export class TotalSystemResources {

    //These fields are not part of the form but they displayed on the componets interface.
    cpuCoresAvailable: number;
    memoryAvailable: number;
    clusterStorageAvailable: number;
    clusterStorageComitted: number;
    clusteredStorageErrors: string;
    clusteredStorageCss: string;
    totalCephDrives: number;
    totalCephDrivesErrors: string;
    totalCephDrivesCss: string;

    totalCephDrivesCache: Object;

    constructor(){
        this.cpuCoresAvailable = 0;
        this.memoryAvailable = 0;
        this.clusterStorageAvailable = 0;
        this.clusterStorageComitted = 0;

        this.clusteredStorageErrors = "";
        this.clusteredStorageCss = "";

        this.totalCephDrives = 0;
        this.totalCephDrivesErrors = "";
        this.totalCephDrivesCss = "";

        this.totalCephDrivesCache = {};
    }

    /**
     * Called when a user clicks on the "Gather Facts" button on a given sensor or server
     * 
     * @param deviceFacts - The Ansible JSON object returned from the REST API.
     */
    public setFromDeviceFacts(deviceFacts: Object) {
        this.cpuCoresAvailable += deviceFacts["cpus_available"];
        this.memoryAvailable += deviceFacts["memory_available"];
        this.memoryAvailable = parseFloat(this.memoryAvailable.toFixed(2));        
    }

    /**
     * Called when we remove a sensor or server from the kit inventory list.
     * 
     * @param deviceFacts - The Ansible JSON object returned from the REST API.
     */
    public subtractFromDeviceFacts(deviceFacts: Object){
        if (deviceFacts){
            this.cpuCoresAvailable -= deviceFacts["cpus_available"];
            this.memoryAvailable -= deviceFacts["memory_available"];
            this.memoryAvailable = parseFloat(this.memoryAvailable.toFixed(2));
        }        
    }

    /**
     * Calculates the total ceph drives properly.
     * 
     * @param ifaceLength 
     * @param deviceFacts 
     */
    public calculateTotalCephDrives(ifaceLength: number, deviceFacts: Object){            
        this.totalCephDrives = 0;        
        this.totalCephDrivesCache[deviceFacts["hostname"]] = ifaceLength;
        for (let key in this.totalCephDrivesCache){
            this.totalCephDrives += this.totalCephDrivesCache[key];
        }
    }
}