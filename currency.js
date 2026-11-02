export function money(value) {
  return 'S/ '+new Intl.NumberFormat('es-PE',{
    minimumFractionDigits:Number.isInteger(value)?0:2,
    maximumFractionDigits:2
  }).format(value);
}
