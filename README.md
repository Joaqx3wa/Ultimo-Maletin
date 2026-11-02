# Último Maletín

26 maletines, una decisión final. Juego web inspirado en Deal or No Deal, con estética azul oscuro y dorado, maletines con relieve y ofertas de la banca.

## Jugar

Primero se presentan los 26 premios con animaciones. Pulsa **Ocultar premios y barajar**: los valores se ocultan y se reparten de nuevo al azar. Después elige tu maletín, que se muestra reservado fuera del tablero. Los otros 25 se organizan en cinco filas de cinco; ábrelos en nueve rondas. Al final de cada ronda, acepta la oferta de la banca o sigue jugando. Si llegas a los dos últimos maletines, puedes conservar el tuyo o cambiarlo.

Todos los importes se expresan en soles peruanos (S/). Premios: 0.01, 1, 5, 10, 25, 50, 75, 100, 200, 300, 400, 500, 750, 1,000, 5,000, 10,000, 25,000, 50,000, 75,000, 100,000, 200,000, 300,000, 400,000, 500,000, 750,000 y 1,000,000.

- Diseño adaptable a celulares y escritorio.
- Presentación animada de los premios, mezcla de maletines y traslado de tu elección a una zona reservada.
- Suspenso antes de cada apertura y teléfono de la banca ilustrado con SVG y animado durante las llamadas.
- Destellos y confeti al eliminar premios pequeños; luz cálida roja, partículas y reacción de pena al perder premios grandes. El desenlace adapta sus efectos al premio final.
- Sonidos originales sintetizados con Web Audio; control de silencio persistente.
- Navegación por teclado, diálogos accesibles y respeto a la preferencia de movimiento reducido.
- Sin cuentas, apuestas, pagos ni premios reales. El dinero es ficticio.

## Desarrollo local

Requiere Node.js 18 o superior. No hay dependencias que instalar.

```sh
npm start
```

Abre http://127.0.0.1:4173. Para comprobar las reglas del juego: `npm test`.

## GitHub Pages

En **Settings → Pages**, selecciona **Deploy from a branch**, rama **main**, carpeta **/ (root)** y guarda. La dirección será https://joaqx3wa.github.io/Ultimo-Maletin/ una vez termine la publicación. Todos los recursos usan rutas relativas.

## Recursos

Maletines y efectos visuales creados con CSS; iconos SVG propios. Todos los sonidos son originales y se sintetizan en el navegador, sin archivos externos ni grabaciones de terceros. Tipografías DM Sans, Playfair Display y Barlow Condensed (números en negrita) mediante Google Fonts (SIL Open Font License), con alternativas del sistema si no hay conexión.

Proyecto independiente, sin afiliación con el programa televisivo ni sus titulares.
