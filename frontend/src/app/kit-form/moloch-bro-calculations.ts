import { KitInventoryForm, SensorFormGroup } from './kit-form';
import { HtmlInput, HtmlHidden } from '../html-elements';

export class MolochBroCalculator {
    kitForm: KitInventoryForm;
    
    
    private sensor_resource_percentages: Array<{ cpu_resource: HtmlInput, cpu_request: HtmlHidden }>;

    constructor(kitForm: KitInventoryForm) {
        this.kitForm = kitForm;
        this.sensor_resource_percentages = [
            { cpu_resource: this.kitForm.sensor_resources.kafka_cpu_percentage, cpu_request: this.kitForm.sensor_resources.kafka_cpu_request },
            { cpu_resource: this.kitForm.sensor_resources.moloch_cpu_percentage, cpu_request: this.kitForm.sensor_resources.moloch_cpu_request },
            { cpu_resource: this.kitForm.sensor_resources.bro_cpu_percentage, cpu_request: this.kitForm.sensor_resources.bro_cpu_request },
            { cpu_resource: this.kitForm.sensor_resources.suricata_cpu_percentage, cpu_request: this.kitForm.sensor_resources.suricata_cpu_request },
            { cpu_resource: this.kitForm.sensor_resources.zookeeper_cpu_percentage, cpu_request: this.kitForm.sensor_resources.zookeeper_cpu_request }
        ]
    }

    private _calculateTotal(): number {
        let total = 0;
        for (let resource of this.sensor_resource_percentages) {
            total += parseInt(resource.cpu_resource.value);
        }
        return total;
    }
    
    /**
     *
     */
    public calculate_bro_and_moloch_threads(): void {
        let total = this._calculateTotal();
        let lowest_cpus = 0;        
        let moloch_threads = 0;
        let bro_threads = 0;

        this.kitForm.sensor_resources.percentAllocated = total;

        if (total < 100 && total > 0) {
            lowest_cpus = this.kitForm.sensor_resources.getLowestCpus();            

            if (lowest_cpus > 0) {
                // We only do this calculation if the algorithm is currently enabled
                if (!this.kitForm.disable_autocalculate.value) {
                    let moloch_request = parseFloat(this.kitForm.sensor_resources.moloch_cpu_request.value)
                    let bro_request = parseFloat(this.kitForm.sensor_resources.bro_cpu_request.value)

                    if (moloch_request <= 1000.00) {
                        moloch_threads = 1;
                    } else {
                        moloch_threads = Math.round(moloch_request / 1000);
                    }                    

                    if (bro_request <= 1000.00) {
                        bro_threads = 1;
                    } else {
                        bro_threads = Math.round(bro_request / 1000);
                    }

                    for (let i = 0; i < this.kitForm.sensors.length; i++) {
                        let sensor = this.kitForm.sensors.at(i) as SensorFormGroup;
                        sensor.moloch_threads.setValue(moloch_threads);
                        sensor.bro_workers.setValue(bro_threads);
                    }
                }
            }
        }
    }
}