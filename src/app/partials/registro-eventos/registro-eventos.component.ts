import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe, formatDate, Location } from '@angular/common';
import { FacadeService } from 'src/app/services/facade.service';
import { EventosService } from 'src/app/services/eventos.service';

declare var $: any;

@Component({
  selector: 'app-registro-eventos',
  templateUrl: './registro-eventos.component.html',
  styleUrls: ['./registro-eventos.component.scss']
})
export class EventosComponent implements OnInit {
  @Input() datos_evento: any = {};

  public evento: any = {};
  public errors: any = {};
  public editar: boolean = false;

  // Listas para los select y checkboxes
  public programas: string[] = ['Ingeniería 1', 'Ingeniería 2', 'Ingeniería 3'];
  public tiposEvento: string[] = ['Conferencia', 'Taller', 'Seminario', 'Congreso']; // Puedes ajustarlos a lo que necesites
  public publicos: string[] = ['Estudiantes', 'Profesores', 'Público General']; 

  constructor(
    private eventosService: EventosService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private facadeService: FacadeService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.params['id'];
    
    if (id !== undefined) {
      // Si se está editando un evento
      this.editar = true;
      this.evento = { ...this.datos_evento }; // Asegura que sea una copia separada
    } else {
      // Si es nuevo registro
      this.evento = this.eventosService.esquemaEvento();
      this.evento.publico_objetivo = [];
    }
  }

  public regresar(): void {
    this.location.back();
  }

public registrar() {
  const raw = this.evento;

  // ⏰ Conversión de hora a formato 24h
  const horaInicio = this.to24(raw.horaInicio);
  const horaFin = this.to24(raw.horaFin);

  if (!horaInicio || !horaFin) {
    alert('Por favor, ingresa una hora de inicio y fin válidas. Formato esperado: "3:30 PM" o "15:30".');
    console.error('Horas inválidas:', raw.horaInicio, raw.horaFin);
    return;
  }
// 📅 Conversión de fecha a YYYY-MM-DD (usando el nombre correcto del campo)
const fecha = raw.fecha_de_realizacion instanceof Date
  ? raw.fecha_de_realizacion.toISOString().split('T')[0]
  : raw.fecha_de_realizacion
    ? new Date(raw.fecha_de_realizacion).toISOString().split('T')[0]
    : null;

// 🔢 Conversión segura de cupo
const cupo = raw.cupo_max !== null && raw.cupo_max !== '' ? Number(raw.cupo_max) : null;

const body = {
  titulo: raw.titulo,
  tipo_de_evento: raw.tipo_de_evento,             // ← CAMBIADO
  fecha_de_realizacion: this.datePipe.transform(raw.fecha_de_realizacion, 'yyyy-MM-dd'),
  hora_inicio: horaInicio,
  hora_fin: horaFin,
  lugar: raw.lugar,
  publico_objetivo: raw.publico_objetivo?.join(', '),
  programa_educativo: raw.programa_educativo,     // ← CAMBIADO
  responsable_del_evento: raw.responsable_del_evento, // ← CAMBIADO
  descripcion_breve: raw.descripcion_breve,       // ← CAMBIADO
  cupo_max: Number(raw.cupo_max)                  // ← CAMBIADO
};

// 🐞 Mostrar el cuerpo del evento en consola antes de validaciones
console.log('📦 Evento a enviar:', JSON.stringify(body, null, 2));

// ✅ VALIDACIÓN antes de enviar
if (
  !body.titulo ||
  !body.tipo_de_evento ||
  !body.fecha_de_realizacion ||
  !body.publico_objetivo?.length ||
  !body.programa_educativo ||
  !body.responsable_del_evento ||
  !body.descripcion_breve ||
  body.cupo_max == null
) {
  alert("Por favor completa todos los campos obligatorios.");
  return;
}

// ✅ Verificación de hora de inicio y hora de fin
if (!body.hora_inicio || !body.hora_fin) {
  alert("Por favor, selecciona las horas de inicio y fin.");
  return;
}

// ✅ Validación de cupo_max: Debe ser un número entre 1 y 999
if (body.cupo_max <= 0 || body.cupo_max > 999) {
  alert("El cupo máximo debe ser un número entre 1 y 999.");
  return;
}

// ✅ Enviar al backend
this.eventosService.registrarEvento(body).subscribe({
  next: () => {
    alert('✅ Evento registrado correctamente.');
    this.router.navigate(['/home']);
  },
  error: e => console.error('Backend devolvió:', e.error)
});

}

  /** Convierte "3:30 PM" en "15:30:00" */
 private to24(t12: string): string | null {
  if (!t12 || typeof t12 !== 'string') return null;

  const date = new Date('1970-01-01 ' + t12);
  if (isNaN(date.getTime())) {
    console.error(`Hora inválida: "${t12}"`);
    return null;
  }

  return formatDate(date, 'HH:mm:ss', 'en-US');
}

  public actualizar(): void {
    this.errors = this.eventosService.validarEvento(this.evento, this.editar);

    if (!$.isEmptyObject(this.errors)) {
      return;
    }

    this.eventosService.editarEvento(this.evento).subscribe({
      next: () => {
        alert('Evento actualizado correctamente');
        this.router.navigate(['home']);
      },
      error: () => {
        alert('No se pudo actualizar el evento');
      }
    });
  }

  // Manejo de checkboxes de público objetivo
  public checkboxPublicoChange(event: any): void {
    const value = event.source.value;

    if (event.checked) {
      if (!this.evento.publico_objetivo.includes(value)) {
        this.evento.publico_objetivo.push(value);
      }
    } else {
      this.evento.publico_objetivo = this.evento.publico_objetivo.filter((p: string) => p !== value);
    }
  }

  public revisarPublico(valor: string): boolean {
    return this.evento.publico_objetivo?.includes(valor);
  }

  // Conversión de fechas al formato YYYY-MM-DD
  public changeFechaInicio(event: any): void {
    const fecha = event.value;
    if (fecha) {
     this.evento.fecha_de_realizacion = fecha.toISOString().split('T')[0]; // ✅ correcto
    }
  }


  public changeFechaFin(event: any): void {
    const fecha = event.value;
    if (fecha) {
      this.evento.fecha_fin = fecha.toISOString().split('T')[0];
    }
  }

  public changeFechaRealizacion(event: any): void {
  const fecha = event.value;
  if (fecha) {
    this.evento.Fecha_de_realizacion = fecha.toISOString().split('T')[0];
  }
}

}
