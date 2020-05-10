import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { QuestionsService } from 'app/overview/services/questions.service';
import { MatSnackBar } from '@angular/material';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-questions',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})

export class QuestionComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  public questions: any[] = [];
  displayedColumns: string[] = ['Asin', 'Usuario', 'Producto', 'Pregunta', 'Respuesta', 'Acciones'];
  dataSource = new MatTableDataSource<any>(this.questions);
  public path: string;

  constructor(
    private questionService: QuestionsService,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    public router: Router
    /* @Inject(MAT_DIALOG_DATA) public data: any */
  ) { }

  ngOnInit() {
    this.path = this.router.url;
    this.questionService.getAllQuestions().subscribe(
      res => {
        this.dataSource.paginator = this.paginator;
        if (Array.isArray(res.result.message)) {
          this.questions = res.result.message;
          this.questions.forEach((element => element.answer = ''));
          this.dataSource.data = this.questions;
        } else {
          console.log('Dont is array');
        }
      },
      err => console.error()
    )
  }

  /**
   * openSnackBar: Open a little dialog
   */
  public openSnackBar(msg, icon) {
    this._snackBar.open(msg, icon, {
      duration: 5 * 1000,
      verticalPosition: 'top'
    });
  }

  /**
   * openDetailProduct
   */
  public openDetailProduct(question) {
    const url = `https://articulo.kiero.co/product-details/?id-${question.Producto_Id}--${question.Titulo}`;
    window.open(url);
  }

  /**
   * goToAmazon: Let take the asin from amazon and go to amazon´s page
   */
  public goToAmazon(asin) {
    const url = ` https://www.amazon.com/gp/product/${asin}/ref=ppx_yo_dt_b_asin_title_o00_s00?ie=UTF8&psc=1`;
    window.open(url)
  }

  /**
   * sendAnswer: Send the id from the question and the answer
   */
  public sendAnswer(question) {
    this.questionService.sendAnswer(question).subscribe(
      res => {
        if (res.status === 'success' && res.result.code === 1) {
          this.openSnackBar(`${res.result.message}`, '🙌');
          this.questions = res.questions_avalible;
          this.dataSource.data = this.questions;
        } else {
          this.openSnackBar(res.result.message ? res.result.message : 'Oopps.. 😱 Ocurrio un error enviando la respuesta', '😭')
        }
      },
      err => console.error(err)
    )
  }

  /**
   * closeAllModals
   */
  public closeAllModals() {
    this.dialog.closeAll();
  }
}
