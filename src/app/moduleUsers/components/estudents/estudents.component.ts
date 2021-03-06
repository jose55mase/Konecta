import { Component, OnInit, Inject, Input, Output, EventEmitter, ElementRef   , ViewChild } from '@angular/core';
import { UploadService } from 'app/services/upload';
import { HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';  
import { catchError, map } from 'rxjs/operators';  
import {saveAs} from 'file-saver';

import Swal from 'sweetalert2';
import { NotificationService } from 'app/services/notification-service';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { FileService } from 'app/services/file.service';
import { UsersService } from 'app/services/usuario.service';
import { Router } from '@angular/router';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: 'app-estudents',
  templateUrl: './estudents.component.html',
  styleUrls: ['./estudents.component.scss'],
  providers: [UploadService,FileService],


})
export class EstudentsComponent implements OnInit {
  table : boolean = false;
  import : boolean = false;
  form : boolean = false;
  wait : boolean = false;
  createform : boolean = false;
  objet = new Object;
  fileName= 'ExcelSheet.xlsx';  
  dataEstudent = []
  name = 'Angular 6';
  data: any = [
    {
      Nombre: "",
      Apellidos: "",
      Documento: "",
      Telefonos: "",
      Acudiente: "",
      Direccion: "",
      Email: "",
      Edad: "",
      Grupo: "",
      Salon: "",
      Grado: ""
    },
  ];
  constructor(
    private _fileService:FileService,
    private excelService:UploadService,
    private usersService : UsersService,
    private notificationService : NotificationService,
    private ROUTER : Router,
    ){

  }
  exportAsXLSX():void {
    this.excelService.exportAsExcelFile(this.data, 'Formato_Estudiantes');// exportAsXLSX de a mano
  }

  downloadExportAsXLSX(index){
    this._fileService.downloadFile("estudiantes.xlsx")
    .subscribe(
        data => saveAs(data, "estudiantes_Formato_XLSX"),
        error => console.error(error)
    );
  }
  
  
  
  ngOnInit(){}
  
  arrayBuffer:any;
  file:File;
  incomingfile(event){
    this.file= event.target.files[0]; 
  }

 
  filelist: any;
  addfile(event){  
    this.table= false  
    this.file= event.target.files[0];     
    let fileReader = new FileReader();    
    fileReader.readAsArrayBuffer(this.file);     
    fileReader.onload = (e) => {    
        this.arrayBuffer = fileReader.result;    
        var data = new Uint8Array(this.arrayBuffer);    
        var arr = new Array();    
        for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);    
        var bstr = arr.join("");    
        var workbook = XLSX.read(bstr, {type:"binary"});    
        var first_sheet_name = workbook.SheetNames[0];    
        var worksheet = workbook.Sheets[first_sheet_name];    
        this.dataEstudent = XLSX.utils.sheet_to_json(worksheet,{raw:true});
        sessionStorage.setItem("usuarios",JSON.stringify(this.dataEstudent))   
        console.log(XLSX.utils.sheet_to_json(worksheet,{raw:true}));
        
          var arraylist = XLSX.utils.sheet_to_json(worksheet,{raw:true});     
              this.filelist = [];
        
    } 
  }
  showform(){
    this.form = true;
    
  }
  dowloadShow(){
    this.createform = true;
    this.import = false;
  }
  ImportShow(){
    this.createform =  false;
    this.import = true;
  }
  savaDataEstudent(){
    this.wait = true
    var save = this.savedata()
    setTimeout(()=>{
      if(save.menssge == "OK"){
        this.notificationService.alert('🎓', "Registro guardado correctamente", 'success');
        this.wait = false
        this.table = true;
        this.ROUTER.navigate(['/users'])
      }else{
        this.notificationService.alert('💤', "Error", 'error');
      }
    },1000)
    
  }
  public savedata(){  
    var status
    this.dataEstudent.map((data)=>{
      var idesData = Date.now()
      this.objet = {
        id:idesData,
        Documento: data.Documento,
        Nombre:data.Nombre,
        Apellidos: data.Apellidos,
        Telefonos : data.Telefonos,
        Acudiente : data.Acudiente,
        Direccion: data.Direccion,
        Email: data.Email,
        Edad : 0,
        Grupo: data.Grupo,
        Salon :data.Salon,
        Grado: data.Grado,
        Rol: "Estudiante"
      }
      this.usersService.save(this.objet).subscribe(
        (response)=>{({menssge:"OK"})},
        (error)=>{ ({menssge:"ERROR"})}
        )
    })
    
    return ({menssge:"OK"})
  }


}

