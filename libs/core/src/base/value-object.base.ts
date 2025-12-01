/**
 * @fileoverview Clase Base para Objetos de Valor (Value Objects)
 * @module Core/Base
 * @author Raz Podestá & LIA Legacy
 * @description
 * Implementa la igualdad estructural y la inmutabilidad.
 * Un Value Object se define por sus atributos, no por su identidad.
 */

export type Primitives = string | number | boolean | Date;

export interface DomainPrimitive<T extends Primitives | object> {
  value: T;
}

export abstract class ValueObject<T extends Primitives | object> {
  protected readonly props: DomainPrimitive<T>;

  constructor(props: DomainPrimitive<T>) {
    this.props = Object.freeze(props);
  }

  /**
   * Retorna el valor crudo del objeto.
   */
  public get value(): T {
    return this.props.value;
  }

  /**
   * Compara la igualdad estructural con otro Value Object.
   * @param vo Objeto a comparar
   */
  public equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    if (vo.props === undefined) {
      return false;
    }
    return JSON.stringify(this.props) === JSON.stringify(vo.props);
  }
}
