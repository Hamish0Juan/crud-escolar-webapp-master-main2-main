import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { EventosService } from 'src/app/services/eventos.service';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-eventos-screen',
  templateUrl: './registro-eventos-screen.component.html',
  styleUrls: ['./registro-eventos-screen.component.scss']
})
export class EventosScreenComponent implements OnInit, AfterViewInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_eventos: any[] = [];

  displayedColumns: string[] = ['id', 'nombre', 'programa', 'fecha_inicio', 'fecha_fin', 'lugar', 'editar'];
  dataSource = new MatTableDataSource<any>(this.lista_eventos);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private eventosService: EventosService,
    private facadeService: FacadeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    this.token = this.facadeService.getSessionToken();

    if (!this.token) {
      this.router.navigate([""]);
      return;
    }

    this.obtenerEventos();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.initPaginator();
  }

  public initPaginator(): void {
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.paginator._intl.itemsPerPageLabel = 'Registros por página';
      this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
        if (length === 0 || pageSize === 0) return `0 de ${length}`;
        const start = page * pageSize;
        const end = start < length ? Math.min(start + pageSize, length) : start + pageSize;
        return `${start + 1} - ${end} de ${length}`;
      };
      this.paginator._intl.firstPageLabel = 'Primera página';
      this.paginator._intl.lastPageLabel = 'Última página';
      this.paginator._intl.previousPageLabel = 'Página anterior';
      this.paginator._intl.nextPageLabel = 'Página siguiente';
    }, 500);
  }

  public obtenerEventos(): void {
    this.eventosService.obtenerEventos().subscribe(
      (response) => {
        this.lista_eventos = response;
        this.dataSource = new MatTableDataSource(this.lista_eventos);
      },
      (error) => {
        alert("No se pudo obtener la lista de eventos");
      }
    );
  }

  public goEditar(idEvento: number): void {
    this.router.navigate(["registro-eventos/" + idEvento]);
  }

}
