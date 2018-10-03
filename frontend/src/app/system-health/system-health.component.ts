import { Component, OnInit } from '@angular/core';
import { HealthServiceService } from '../health-service.service';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { HtmlModalPopUp, ModalType } from '../html-elements';

@Component({
  selector: 'app-system-health',
  templateUrl: './system-health.component.html',
  styleUrls: ['./system-health.component.css']
})
export class SystemHealthComponent implements OnInit {
  podsStatuses: Object;
  nodeStatuses: Object;
  podDescribeModal: HtmlModalPopUp;

  constructor(private title: Title, private healthSrv: HealthServiceService, private router: Router) { 
    this.podDescribeModal = new HtmlModalPopUp('pod_describe');
  }

  ngOnInit() {
    this.title.setTitle("System Health");

    this.healthSrv.getPodsStatuses().subscribe(data => {
      this.podsStatuses = data;
    });

    this.healthSrv.getNodeStatuses().subscribe(data => {
      this.nodeStatuses = data;
    });
  }

  performSystemsCheck(){
    this.healthSrv.performSystemsCheck()
      .subscribe(data => {
        this.openConsole();
    });
  }

  openConsole(){
    this.router.navigate(['/stdout/SystemsCheck'])
  }

  describePod(podName: string) {
    this.healthSrv.describePod(podName).subscribe(data => {      
      this.podDescribeModal.updateModal(podName, data['stdout'], 'Close', undefined, ModalType.code);
      this.podDescribeModal.openModal();
    });
  }

  describeNode(nodeName: string) {
    this.healthSrv.describeNode(nodeName).subscribe(data => {
      this.podDescribeModal.updateModal(nodeName, data['stdout'], 'Close', undefined, ModalType.code);
      this.podDescribeModal.openModal();
    })
  }

  openNodeInfo(nodeName: string, nodeInfo: Object){
    this.podDescribeModal.updateModal(nodeName + " info", JSON.stringify(nodeInfo, null, 2).trim(), 'Close', undefined, ModalType.code);
    this.podDescribeModal.openModal();
  }

  openPodStatusInfo(podName: string, podStatusInfo: Object){
    this.podDescribeModal.updateModal(podName + " status", JSON.stringify(podStatusInfo, null, 2).trim(), 'Close', undefined, ModalType.code);
    this.podDescribeModal.openModal();
  }
}
