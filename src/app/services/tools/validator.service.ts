import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidatorService {

  constructor() { }

  //Funciones para validaciones
  required(input:any){
    return (input != undefined && input != null && input != "" && input.toString().trim().length > 0);
  }

  max(input:any, size:any){
    return (input.length <= size);
  }

  min(input:any, size:any){
    return (input.length >= size);
  }

  email(input:any){
    var regEx = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return input.match(regEx); // Invalid format
  }

date(input: any): boolean {
  // Si ya es un objeto Date válido
  if (input instanceof Date && !isNaN(input.getTime())) {
    return true;
  }

  // Si es string, validar formato
  if (typeof input === 'string') {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!input.match(regEx)) return false;  // Formato inválido

    const d = new Date(input);
    if (isNaN(d.getTime())) return false;  // Fecha inválida

    return d.toISOString().slice(0, 10) === input;
  }

  // Si no es ni Date ni string válido
  return false;
}


  between(input:any, min:any, max:any){
    return (max >= input >= min);
  }

  numeric(input:any){
    return (!isNaN(parseFloat(input)) && isFinite(input));
  }

  maxDecimals(input:any, size:any) {
    let decimals = 0;

    if (Math.floor(input) !== input && input.toString().split(".")[1]){
      decimals = input.toString().split(".")[1].length
    }

    return (decimals <= size);
  }

  minDecimals(input:any, size:any) {
    let decimals = 0;

    if (Math.floor(input) !== input && input.toString().split(".")[1]){
      decimals = input.toString().split(".")[1].length
    }

    return (decimals >= size);
  }

  dateBetween(input:any, min:any, max:any){

    input = new Date(input).getTime();
    min = new Date(min).getTime();
    max = new Date(max).getTime();

    return  (max >= input && input  >= min);

  }

  words(input:any){
    let pat = new RegExp('^([A-Za-zÑñáéíóúÁÉÍÓÚ ]+)$');
    console.log(pat.test(input), input);
    return pat.test(input);
  }
   wordsAndNumbers(input: any) {
  let pat = new RegExp('^[A-Za-zÑñáéíóúÁÉÍÓÚ0-9 ]+$');
  return pat.test(input);

}

time(input: any): boolean {
  const regEx = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;
  return regEx.test(input);
}


  
}
