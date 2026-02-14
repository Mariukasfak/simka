// Reeksportuojame classNames funkciją, kad ji būtų pasiekiama per '@/utils/styles' kelią
// Originali importo eilutė pašalinta, nes src/ katalogas nebenaudojamas
// export { classNames } from '../src/utils/styles'

/**
 * Sujungia kelias CSS klases į vieną string.
 * Naudinga dinamiškai pridedant klases pagal tam tikras sąlygas.
 */
export function classNames(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(" ");
}
