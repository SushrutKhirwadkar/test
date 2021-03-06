import { Component, OnInit,ViewChild, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ApiserviceService } from '../../../../apiservice.service';
import { UtilService } from '../../../../util.service';
import { IMyDate, IMyDpOptions } from 'mydatepicker';
import { APP_CONFIG } from '../../../../app.config';
import {Http, HttpModule, Headers, RequestOptions} from '@angular/http';
import * as moment from 'moment';
import { NgbModal,NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { AppAssess, AssessmentPolicyDTO, Policy } from '../../../../data.model.assessmentDTO';
import { FormsModule, NgForm, FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { Cookie } from 'ng2-cookies';
declare var swal: any; ''
@Component({
  selector: 'app-assess-recomend',
  templateUrl: './assess-recomend.component.html',
  styleUrls: ['./assess-recomend.component.css']
})
export class AssessRecomendComponent implements OnInit {

  @ViewChild('content') content: TemplateRef<any>;
  @ViewChild('myForm') myForm: FormGroup;

  appAssess: AppAssess;
  public loading:boolean=false;
  public info:any;
  public showSave:boolean=false;
  public editData:any;
  public showEdit:boolean=false;
  public showForm:boolean=true;
  public estDate:any;
  constructor(private _apiservice: ApiserviceService, 
    private utilService: UtilService,private http: Http,private router:Router,
    private route: ActivatedRoute, private modalService: NgbModal,private datepipe: DatePipe) {
      this.appAssess = new AppAssess();
      this.getAppId();
     }

  ngOnInit() {
  }
  showAssess(){
 this.router.navigate(['/locality/tab/assessment/']);
}

showLeft(){
this.router.navigate(['locality/tab/assessment']);
}

getAppId() {
  this.loading=true;
    this._apiservice.viewApplication(localStorage.getItem('localityName'))
      .subscribe((data: any) => {
        this.loading=false;
        this.appAssess.applicationID = data.applicationViewDTO.applicationId;
        this.showOnPageLoad();
      }, error => {
        this.loading = false;
        console.log(error);}
      );
    }

    showOnPageLoad()
    {
      if(localStorage.getItem('assesId') === null)
      {
        console.log('Not edit mode');
      }
      else{
        let id = localStorage.getItem('assesId');
        let auid = +id;
        this.showEdit=true;
        this.loading=true;
      
      this._apiservice.getAssessData(auid)
      .subscribe((data: any) => {
        this.loading = false;
        this.appAssess = data;
        if(this.appAssess.estimatedCompletionDt === null)
      {
        this.estDate = {date:null};
      }
      else{
      let d = new Date(this.appAssess.estimatedCompletionDt);
      let day = d.getDate();
      let month = d.getMonth()+1;
      let year = d.getFullYear();
      this.estDate = {date:{year: year, month: month, day: day}};
      }
      }, error => {
        this.loading = false;
        console.log(error);
      });
      

    }
    
  }

saveRecommendations()
  {
    let ngbModalOptions: NgbModalOptions = {
      backdrop : 'static',
      keyboard : false
      };
    this.loading=true;
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({ headers: headers });
    this.appAssess.updatedBy=Cookie.get('userName');
    let url_update = APP_CONFIG.updateAppAssessment;
    let data = JSON.stringify(this.appAssess);
    this.http.post(url_update,data,options)
        .subscribe((data: any) => {
          this.loading=false;
          const { myForm: { value: formValueSnap } } = this;
        this.myForm.reset(formValueSnap);
          this.info="Recomendations has been updated.";
          this.modalService.open(this.content,ngbModalOptions);
        }, error => {
          this.loading=false;
          console.log(error);
        });
  }

  getEstDate(value)
    {
      if (value.formatted === "") {
        this.appAssess.estimatedCompletionDt=null;
      }
      else {
        let d = value.formatted;
        //this.audate = Date.parse(d);
        let latest_date =this.datepipe.transform(d, 'yyyy-MM-dd');
        this.appAssess.estimatedCompletionDt = moment(latest_date).format();
      }
      
    }

    valueChanged()
    {
      this.showForm=false;
      this.showSave=true;
      this.showEdit=false;
    }
    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
      // console.log(this.myForm);
      // console.log(this.myForm.dirty);
      //if (this.myForm.classList[3] === 'ng-touched' || this.myForm.nativeElement.classList[3] === 'ng-dirty') {
      if (this.myForm.dirty) {
        //return this.dialogService.confirm('Discard changes for Budget?');
        //const modal=this.modalService.open(this.content1, ngbModalOptions);
  
        return this.confirm1('Do you want to save changes?', 'for recomendations', 'YES', 'NO');
  
  
      }
  
      return true;
  
    }
  
  
  
  
    confirm1(title = 'Are you sure?', text, confirmButtonText, cancelButtonText, showCancelButton = true) {
      return new Promise<boolean>((resolve, reject) => {
        swal({
          title: title,
          text: text,
          type: 'warning',
          showCancelButton: showCancelButton,
          confirmButtonText: confirmButtonText,
          cancelButtonText: cancelButtonText,
          allowOutsideClick: false
        }).then((result) => {
          if (result.value !== undefined && result.value) {
            this.saveRecommendations();
            resolve(false);
          }
          else {
            resolve(true);
          }
        }, error => reject(error));
      });
  
  
  
  
    }
  



  

}
